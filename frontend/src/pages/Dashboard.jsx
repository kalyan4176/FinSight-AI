import React, { useEffect, useState } from 'react';
import { FaWallet, FaMoneyBillWave, FaPiggyBank, FaBriefcase, FaArrowUp, FaArrowDown, FaCalendarAlt, FaBrain, FaRegChartBar } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useCurrency } from '../context/CurrencyContext';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const { formatCurrency, currencies, currentCurrency } = useCurrency();
    const symbol = currencies[currentCurrency]?.symbol || '₹';
    const [summary, setSummary] = useState({
        totalExpenses: 0,
        salary: 0,
        name: '',
        portfolioValue: 0,
        portfolioProfitLoss: 0,
        portfolioProfitPercent: 0
    });
    const [expenseData, setExpenseData] = useState({ labels: [], datasets: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState({
        healthScore: 70,
        healthLabel: 'Good',
        nextMonthForecast: 0,
        forecastTimeline: [],
        insights: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch basic logs
                const expensesRes = await api.get('/expenses');
                const userRes = await api.get('/user/profile');
                let investmentsRes = { data: [] };
                
                try {
                    investmentsRes = await api.get('/investments');
                } catch (invErr) {
                    console.error("Could not load investments for dashboard", invErr);
                }

                const totalExp = expensesRes.data.reduce((acc, curr) => acc + curr.amount, 0);
                
                // Calculate investment stats
                const totalInvValue = investmentsRes.data.reduce((acc, curr) => acc + curr.currentValue, 0);
                const totalInvCost = investmentsRes.data.reduce((acc, curr) => acc + curr.costBasis, 0);
                const invProfitLoss = totalInvValue - totalInvCost;
                const invProfitPercent = totalInvCost > 0 ? (invProfitLoss / totalInvCost) * 100 : 0;

                setSummary({
                    totalExpenses: totalExp,
                    salary: userRes.data.salary || 0,
                    name: userRes.data.name || '',
                    portfolioValue: totalInvValue,
                    portfolioProfitLoss: invProfitLoss,
                    portfolioProfitPercent: invProfitPercent
                });

                // Chart Data Logic for Doughnut
                const categories = {};
                expensesRes.data.forEach(exp => {
                    categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
                });

                setExpenseData({
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#64748b'],
                        borderWidth: 0
                    }]
                });

                // Fetch AI analytics and insights
                try {
                    const insightsRes = await api.get('/insights');
                    setAiInsights({
                        healthScore: insightsRes.data.healthScore || 70,
                        healthLabel: insightsRes.data.healthLabel || 'Good',
                        nextMonthForecast: insightsRes.data.nextMonthForecast || 0,
                        forecastTimeline: insightsRes.data.forecastTimeline || [],
                        insights: insightsRes.data.insights || []
                    });
                } catch (insErr) {
                    console.error("Could not load AI Insights", insErr);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const remainingBudget = summary.salary - summary.totalExpenses;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-500 animate-pulse">Running financial analysis...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-24 md:pb-8 bg-transparent"
        >
            {/* Header Greeting */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                        {getGreeting()}, {summary.name || 'User'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Here's your real-time financial standing and predictive analytics report.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200/60 rounded-xl shadow-sm text-xs font-semibold text-slate-600">
                    <FaCalendarAlt className="text-primary-500" />
                    <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
            </motion.div>

            {/* AI Insights Alert Banner */}
            {aiInsights.insights.length > 0 && (
                <motion.div 
                    variants={itemVariants} 
                    className="premium-card bg-gradient-to-r from-primary-50 to-teal-50/20 border border-primary-200/30 flex flex-col md:flex-row gap-6 p-6 items-start md:items-center justify-between"
                >
                    <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-sm mt-0.5 md:mt-0">
                            <FaBrain className="text-lg animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                                FinSight AI Recommendations
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                                Our models analyzed your spending categories and portfolios. Check out these personalized suggestions:
                            </p>
                            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 mt-2">
                                {aiInsights.insights.map((insight, idx) => (
                                    <li key={idx} className="leading-relaxed">{insight}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Core Metrics Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Income Card */}
                <div className="premium-card">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Income</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 font-sans">{formatCurrency(summary.salary)}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                            <FaMoneyBillWave className="text-lg" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-xs font-medium text-slate-400">
                        <span>Base budget configuration</span>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="premium-card">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spend</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 font-sans">{formatCurrency(summary.totalExpenses)}</h3>
                        </div>
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                            <FaWallet className="text-lg" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-rose-600">
                        <FaArrowUp />
                        <span>{summary.salary > 0 ? `${((summary.totalExpenses / summary.salary) * 100).toFixed(0)}%` : '0%'} of income</span>
                    </div>
                </div>

                {/* Remaining Budget */}
                <div className="premium-card">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Budget</p>
                            <h3 className={`text-2xl font-extrabold font-sans ${remainingBudget >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                {formatCurrency(remainingBudget)}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl border ${remainingBudget >= 0 ? 'bg-primary-50 text-primary-600 border-primary-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            <FaPiggyBank className="text-lg" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-600">
                        {remainingBudget >= 0 ? (
                            <>
                                <FaArrowDown />
                                <span>Positive savings rate</span>
                            </>
                        ) : (
                            <span className="text-rose-600 font-semibold">Over-budget warning</span>
                        )}
                    </div>
                </div>

                {/* Investments Card */}
                <div className="premium-card">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio Assets</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 font-sans">{formatCurrency(summary.portfolioValue)}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                            <FaBriefcase className="text-lg" />
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 mt-4 text-xs font-semibold ${summary.portfolioProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {summary.portfolioProfitLoss >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                        <span>
                            {summary.portfolioProfitPercent.toFixed(1)}% ({summary.portfolioProfitLoss >= 0 ? '+' : ''}{formatCurrency(summary.portfolioProfitLoss)})
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Financial Health Score & Allocation Analytics */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health Score Circular Panel */}
                <div className="premium-card flex flex-col justify-between items-center text-center p-8">
                    <div className="w-full text-left">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Financial Health Score</p>
                    </div>

                    <div className="relative my-6 flex items-center justify-center">
                        {/* Circular track */}
                        <svg className="w-36 h-36 transform -rotate-90">
                            <circle cx="72" cy="72" r="62" strokeWidth="8" stroke="#f1f5f9" fill="transparent" />
                            <circle 
                                cx="72" 
                                cy="72" 
                                r="62" 
                                strokeWidth="8" 
                                stroke={aiInsights.healthScore >= 75 ? '#10b981' : aiInsights.healthScore >= 50 ? '#f59e0b' : '#f43f5e'} 
                                fill="transparent" 
                                strokeDasharray={2 * Math.PI * 62}
                                strokeDashoffset={2 * Math.PI * 62 * (1 - aiInsights.healthScore / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-4xl font-extrabold text-slate-900 font-sans">{aiInsights.healthScore}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">out of 100</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            aiInsights.healthScore >= 75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            aiInsights.healthScore >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                            Status: {aiInsights.healthLabel}
                        </span>
                        <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed mt-2 mx-auto">
                            Calculated dynamically based on your savings, discretionary metrics, and volatility.
                        </p>
                    </div>
                </div>

                {/* Expense Categories Allocation */}
                <div className="premium-card md:col-span-2 flex flex-col justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Expense Categories Allocation</p>
                    {expenseData.labels && expenseData.labels.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center gap-8 py-2">
                            <div className="w-48 h-48 flex-shrink-0">
                                <Doughnut 
                                    data={expenseData} 
                                    options={{
                                        cutout: '75%',
                                        plugins: { legend: { display: false } },
                                        maintainAspectRatio: false
                                    }} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
                                {expenseData.labels.map((label, idx) => {
                                    const value = expenseData.datasets[0].data[idx];
                                    const color = expenseData.datasets[0].backgroundColor[idx];
                                    const pct = summary.totalExpenses > 0 ? ((value / summary.totalExpenses) * 100).toFixed(0) : 0;
                                    return (
                                        <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-100/60 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                <span className="font-semibold text-slate-700">{label}</span>
                                            </div>
                                            <span className="text-slate-500 font-medium">
                                                {formatCurrency(value)} ({pct}%)
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                            <p className="text-xs text-slate-400 font-semibold">No expense records found. Add expenses to generate charts.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Python Predictive Forecasting Layer */}
            {aiInsights.forecastTimeline && aiInsights.forecastTimeline.length > 0 && (
                <motion.div variants={itemVariants} className="premium-card space-y-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-sans">
                                <FaRegChartBar className="text-primary-500" />
                                Scikit-learn Machine Learning Forecast
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Mathematical projection of expenditures for the next 30 days based on linear regression modeling.
                            </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl text-left flex items-center gap-3">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecasted Next Month Total</p>
                                <p className="text-sm font-extrabold text-primary-600 font-sans">{formatCurrency(aiInsights.nextMonthForecast)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={aiInsights.forecastTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8" 
                                    fontSize={10} 
                                    tickFormatter={(str) => {
                                        try {
                                            const d = new Date(str);
                                            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                        } catch (e) {
                                            return str;
                                        }
                                    }}
                                />
                                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${symbol}${val}`} />
                                <RechartsTooltip 
                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }} 
                                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#1e293b' }}
                                    itemStyle={{ fontSize: '12px', color: '#8b5cf6' }}
                                    formatter={(value) => [formatCurrency(value), 'Predicted Spend']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#forecastGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Dashboard;
