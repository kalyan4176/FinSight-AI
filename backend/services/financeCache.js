const yahooFinance = require('yahoo-finance2').default;

// Simple in-memory cache for live stock/crypto quotes
const cache = {};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Retrieves a ticker quote, serving it from cache if requested within TTL.
 * @param {string} symbol Asset ticker symbol (e.g. AAPL, BTC-USD)
 * @returns {Promise<object>} Yahoo Finance quote object
 */
const getCachedQuote = async (symbol) => {
    const sym = symbol.toUpperCase();
    const now = Date.now();
    
    if (cache[sym] && (now - cache[sym].timestamp) < CACHE_TTL_MS) {
        console.log(`⚡ serving cached Yahoo Finance quote for: ${sym}`);
        return cache[sym].data;
    }
    
    console.log(`🌐 Querying Yahoo Finance API for: ${sym}...`);
    const quote = await yahooFinance.quote(sym);
    if (quote) {
        cache[sym] = {
            timestamp: now,
            data: quote
        };
    }
    return quote;
};

module.exports = {
    getCachedQuote
};
