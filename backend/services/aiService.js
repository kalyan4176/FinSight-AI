const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API client (handle missing key gracefully)
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Scan receipt/bill image using Gemini AI
 * @param {Buffer} buffer File buffer of the image
 * @param {string} mimeType File mime type (e.g., 'image/jpeg')
 * @returns {Promise<{title: string, amount: number, category: string, date: string}>}
 */
const scanBill = async (buffer, mimeType) => {
    if (!genAI) {
        console.warn('⚠️ GEMINI_API_KEY is not configured in .env. Falling back to local OCR mock parser.');
        // Simple mock scanning for demo fallback
        return {
            title: 'Starbucks Coffee (Mock AI)',
            amount: 15.50,
            category: 'Food',
            date: new Date().toISOString().split('T')[0]
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const imagePart = {
            inlineData: {
                data: buffer.toString('base64'),
                mimeType
            }
        };

        const prompt = `Analyze this receipt image. Extract and return:
1. Total transaction amount paid (number, e.g. 45.99)
2. Merchant name/Title (string, e.g. "Walmart")
3. Standard category of purchase. Choose ONLY from: Food, Utilities, Entertainment, Travel, Shopping, Health, Investment, Other
4. Date of transaction (in YYYY-MM-DD format, e.g. "2026-06-28")

Return the results ONLY as a valid JSON object, exactly matching this structure, with no markdown tags, code blocks, or comments:
{
  "title": "Walmart",
  "amount": 45.99,
  "category": "Shopping",
  "date": "2026-06-28"
}`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        // Clean markdown tags if Gemini output includes them
        const jsonStr = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        console.error('❌ Gemini receipt scan error:', err.message);
        console.log('🔄 Falling back to mock OCR scanner due to API failure...');
        return {
            title: 'Mock Receipt (API Quota Exceeded)',
            amount: 28.50,
            category: 'Food',
            date: new Date().toISOString().split('T')[0]
        };
    }
};

/**
 * Categorize expense based on its title
 * @param {string} title Expense title
 * @returns {Promise<string>}
 */
const categorizeExpense = async (title) => {
    if (!genAI) {
        // Local regex fallback
        const titleLower = title.toLowerCase();
        if (titleLower.includes('netflix') || titleLower.includes('movie') || titleLower.includes('spotify') || titleLower.includes('game') || titleLower.includes('show')) return 'Entertainment';
        if (titleLower.includes('uber') || titleLower.includes('flight') || titleLower.includes('train') || titleLower.includes('gas') || titleLower.includes('taxi') || titleLower.includes('travel')) return 'Travel';
        if (titleLower.includes('food') || titleLower.includes('restaurant') || titleLower.includes('eat') || titleLower.includes('grocery') || titleLower.includes('cafe') || titleLower.includes('zomato') || titleLower.includes('swiggy')) return 'Food';
        if (titleLower.includes('water') || titleLower.includes('electricity') || titleLower.includes('rent') || titleLower.includes('internet') || titleLower.includes('bill') || titleLower.includes('power')) return 'Utilities';
        if (titleLower.includes('hospital') || titleLower.includes('medicine') || titleLower.includes('doctor') || titleLower.includes('gym') || titleLower.includes('health')) return 'Health';
        if (titleLower.includes('stock') || titleLower.includes('crypto') || titleLower.includes('gold') || titleLower.includes('invest') || titleLower.includes('mutual')) return 'Investment';
        return 'Shopping';
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Categorize the expense title "${title}" into one of the following categories: Food, Utilities, Entertainment, Travel, Shopping, Health, Investment, Other. Respond with only the single category name, no punctuation, no other text.`;
        
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.error('❌ Gemini categorization error:', err.message);
        return 'Other';
    }
};

/**
 * Generate personalized financial insights and tips
 * @param {object} userProfile User details (salary, currency)
 * @param {array} expenses Array of user expenses
 * @param {array} investments Array of user investments
 * @param {object} forecast Expense forecast object
 * @returns {Promise<string[]>} Array of insight recommendations
 */
const generateInsights = async (userProfile, expenses, investments, forecast) => {
    if (!genAI) {
        return [
            "⚠️ GEMINI_API_KEY is not configured in your backend .env file. AI Recommendations are running in simulation mode.",
            `Your current monthly budget is ${userProfile.currency} ${userProfile.salary.toLocaleString()}. Monitor your expenses to verify they stay below this limit.`,
            "Discretionary spending is the easiest area to optimize. Focus on reducing eating out and impulse shopping.",
            "Automate a fixed percentage of your monthly income (e.g. 20%) into your investments on salary day.",
            "Review your investment portfolio quarterly to rebalance asset allocation as markets fluctuate."
        ];
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const totalCostBasis = investments.reduce((acc, curr) => acc + (curr.costBasis || 0), 0);
        const totalCurrentVal = investments.reduce((acc, curr) => acc + (curr.currentValue || 0), 0);
        
        const prompt = `You are FinSight AI, a premier financial intelligence expert advising a client.
Analyze the user's financial profile below and generate exactly 4-5 highly specific, actionable, and smart recommendation bullets.

User Financial Summary:
- Monthly Salary/Income: ${userProfile.salary} ${userProfile.currency}
- Total Investment Cost Basis: ${totalCostBasis} ${userProfile.currency}
- Current Portfolio Market Value: ${totalCurrentVal} ${userProfile.currency}
- Next Month Forecasted Expenses: ${forecast.nextMonthForecast} ${userProfile.currency}

Recent Expenses Log:
${JSON.stringify(expenses.slice(0, 15), null, 2)}

Provide a JSON array of strings containing unique and personalized financial insights. Write in direct, engaging, and professional language. Ensure there are no markdown formatting blocks, no backticks, just raw JSON text.
Example Format:
[
  "Your Dining Out is up 12% compared to last week. Consider home cooking to save up to 150 EUR.",
  "Your current portfolio has a +8.5% gain. Gold represents 40% of holdings, consider diversifying to stock index funds..."
]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        console.error('❌ Gemini insight generation failed:', err.message);
        return [
            "Automate your savings by transferring 15% of your income into high-yield assets on salary day.",
            "Compare monthly non-discretionary expenses (rent, bills) to identify potential subscription leaks.",
            "Your investment portfolio shows positive growth. Ensure you are diversified across stock indices and gold."
        ];
    }
};

module.exports = {
    scanBill,
    categorizeExpense,
    generateInsights
};
