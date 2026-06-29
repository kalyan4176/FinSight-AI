const express = require('express');
const router = express.Router();
const { getCachedQuote } = require('../services/financeCache');
const auth = require('../middleware/auth');

// Get quote for a symbol (Stock or Crypto or Gold)
// Gold symbol in Yahoo Finance is usually 'GC=F'
router.get('/quote/:symbol', auth, async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const quote = await getCachedQuote(symbol);

        if (!quote) {
            return res.status(404).json({ msg: 'Symbol not found' });
        }

        res.json({
            symbol: quote.symbol,
            name: quote.shortName || quote.longName,
            price: quote.regularMarketPrice,
            currency: quote.currency,
            change: quote.regularMarketChangePercent
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error or Invalid Symbol');
    }
});

module.exports = router;
