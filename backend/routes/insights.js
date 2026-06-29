const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Investment = require('../models/Investment');
const aiService = require('../services/aiService');

const runPythonAnalytics = (data) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../analytics/analyticsEngine.py');
        const pythonProcess = spawn('python', [scriptPath]);
        
        let result = '';
        let errorResult = '';
        
        // Timeout guard: kill process after 800ms to keep page load times fast
        const timeout = setTimeout(() => {
            console.warn('⚠️ Python Analytics Subprocess timed out (800ms limit). Terminating...');
            pythonProcess.kill();
            reject(new Error('Subprocess execution timed out after 800ms'));
        }, 800);
        
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorResult += data.toString();
        });
        
        pythonProcess.on('error', (err) => {
            clearTimeout(timeout);
            console.error('❌ Failed to start Python process:', err.message);
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
        
        pythonProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorResult}`));
            } else {
                try {
                    resolve(JSON.parse(result));
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${result}`));
                }
            }
        });
        
        pythonProcess.stdin.on('error', (err) => {
            console.error('❌ Stdin write error on Python subprocess:', err.message);
        });
        
        // Write stringified input data to Python's stdin
        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();
    });
};

/**
 * Computes high-fidelity math models natively in JS when Python times out.
 */
const fallbackAnalytics = (user, expenses) => {
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const salary = user.salary || 5000;
    
    let nextMonthForecast = totalExp;
    let forecastTimeline = [];
    
    if (expenses.length >= 2) {
        const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(sorted[0].date).getTime();
        
        const points = sorted.map(e => ({
            x: (new Date(e.date).getTime() - firstDate) / (1000 * 60 * 60 * 24),
            y: e.amount
        }));
        
        const n = points.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (const p of points) {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        }
        
        const meanX = sumX / n;
        const meanY = sumY / n;
        
        let num = 0;
        let den = 0;
        for (const p of points) {
            num += (p.x - meanX) * (p.y - meanY);
            den += (p.x - meanX) * (p.x - meanX);
        }
        
        const slope = den === 0 ? 0 : num / den;
        const intercept = meanY - slope * meanX;
        
        const lastDay = points[n - 1].x;
        let projectedSum = 0;
        for (let i = 1; i <= 30; i++) {
            const day = lastDay + i;
            const amount = Math.max(0, slope * day + intercept);
            projectedSum += amount;
            
            const date = new Date(firstDate + day * 24 * 60 * 60 * 1000);
            forecastTimeline.push({
                date: date.toISOString().split('T')[0],
                amount: Math.round(amount * 100) / 100
            });
        }
        nextMonthForecast = Math.round(projectedSum * 100) / 100;
    } else {
        const firstDate = new Date().getTime();
        for (let i = 1; i <= 30; i++) {
            const date = new Date(firstDate + i * 24 * 60 * 60 * 1000);
            forecastTimeline.push({
                date: date.toISOString().split('T')[0],
                amount: expenses.length > 0 ? expenses[0].amount : 0
            });
        }
        nextMonthForecast = totalExp * 30;
    }
    
    const savings = Math.max(0, salary - totalExp);
    const savingsRate = salary > 0 ? (savings / salary) * 100 : 0;
    
    let score = 50;
    if (savingsRate >= 30) score += 25;
    else if (savingsRate >= 10) score += 10;
    else score -= 15;
    
    const discretionaryExp = expenses.filter(e => e.isDiscretionary).reduce((sum, e) => sum + e.amount, 0);
    const discRatio = totalExp > 0 ? (discretionaryExp / totalExp) * 100 : 0;
    if (discRatio <= 20) score += 15;
    else if (discRatio >= 50) score -= 15;
    
    score = Math.max(10, Math.min(99, score));
    
    let label = 'Fair';
    if (score >= 85) label = 'Excellent';
    else if (score >= 70) label = 'Good';
    else if (score < 40) label = 'Poor';

    const categories = {};
    expenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    return {
        healthScore: score,
        healthLabel: label,
        nextMonthForecast,
        forecastTimeline,
        statistics: {
            totalSpend: totalExp,
            savingsRate: Math.round(savingsRate * 10) / 10,
            income: salary,
            categoryBreakdown: categories
        }
    };
};

// @route   GET api/insights
// @desc    Retrieve Python forecast and health scoring combined with Gemini insights
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        const investments = await Investment.findAll({ where: { userId: req.user.id } });

        // Enrich investments cost bases for calculations
        const enrichedInvestments = investments.map(inv => {
            const raw = inv.get({ plain: true });
            raw.costBasis = raw.quantity * raw.buyPrice;
            raw.currentValue = raw.costBasis; // fallback values
            return raw;
        });

        // Structure input variables for pandas / scikit-learn
        const analyticsInput = {
            salary: user.salary || 0,
            expenses: expenses.map(e => ({
                amount: e.amount,
                date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : new Date(e.date).toISOString().split('T')[0],
                category: e.category,
                isDiscretionary: e.isDiscretionary
            }))
        };

        // Execute calculations in Python subprocess
        let analyticsResult;
        try {
            analyticsResult = await runPythonAnalytics(analyticsInput);
            if (analyticsResult.error) {
                console.error('Python Analytics Internal Error:', analyticsResult.error);
                throw new Error(analyticsResult.error);
            }
        } catch (pyErr) {
            console.warn('⚡ Fallback native JS analytics executed:', pyErr.message);
            analyticsResult = fallbackAnalytics(user, expenses);
        }

        // Call Gemini model for tailored recommendations
        const recommendations = await aiService.generateInsights(
            { salary: user.salary || 0, currency: user.currency || 'INR' },
            expenses,
            enrichedInvestments,
            { nextMonthForecast: analyticsResult.nextMonthForecast }
        );

        // Return combined analytics-AI packet
        res.json({
            ...analyticsResult,
            insights: recommendations
        });

    } catch (err) {
        console.error('❌ GET /api/insights error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
