const express = require('express');
const router = express.Router();
const { getCachedQuote } = require('../services/financeCache');
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');

// @route   GET api/investments
// @desc    Get all users investments with live market valuations from Yahoo Finance
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const investments = await Investment.findAll({
            where: { userId: req.user.id }
        });

        // Enrich with current prices from Yahoo Finance API
        const enrichedInvestments = await Promise.all(investments.map(async (inv) => {
            const rawInv = inv.get({ plain: true });
            try {
                // Fetch active stock/crypto/gold quote
                const quote = await getCachedQuote(inv.symbol.toUpperCase());
                if (quote) {
                    rawInv.currentPrice = quote.regularMarketPrice || inv.buyPrice;
                    rawInv.name = quote.longName || quote.shortName || inv.name;
                    rawInv.changePercent = quote.regularMarketChangePercent || 0;
                } else {
                    rawInv.currentPrice = inv.buyPrice;
                    rawInv.changePercent = 0;
                }
            } catch (err) {
                console.warn(`⚠️ Yahoo Finance quote fail for ${inv.symbol}:`, err.message);
                rawInv.currentPrice = inv.buyPrice;
                rawInv.changePercent = 0;
            }

            rawInv.costBasis = rawInv.quantity * rawInv.buyPrice;
            rawInv.currentValue = rawInv.quantity * rawInv.currentPrice;
            rawInv.gainLoss = rawInv.currentValue - rawInv.costBasis;
            rawInv.gainLossPercent = rawInv.costBasis > 0 ? (rawInv.gainLoss / rawInv.costBasis) * 100 : 0;

            return rawInv;
        }));

        res.json(enrichedInvestments);
    } catch (err) {
        console.error('Error fetching investments:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/investments
// @desc    Add new investment holding
// @access  Private
router.post('/', auth, async (req, res) => {
    const { symbol, name, quantity, buyPrice, category, date } = req.body;

    try {
        const investment = await Investment.create({
            symbol: symbol.trim().toUpperCase(),
            name: name || symbol.trim().toUpperCase(),
            quantity: parseFloat(quantity),
            buyPrice: parseFloat(buyPrice),
            category: category || 'Stock',
            date: date || new Date(),
            userId: req.user.id
        });

        res.json(investment);
    } catch (err) {
        console.error('Error adding investment:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/investments/:id
// @desc    Delete investment holding
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const investment = await Investment.findByPk(req.params.id);

        if (!investment) {
            return res.status(404).json({ msg: 'Investment holding not found' });
        }

        // Make sure user owns investment
        if (investment.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await investment.destroy();

        res.json({ msg: 'Investment removed' });
    } catch (err) {
        console.error('Error deleting investment:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
