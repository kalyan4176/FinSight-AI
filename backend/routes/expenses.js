const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const aiService = require('../services/aiService');

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// @route   GET api/expenses
// @desc    Get all users expenses
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, amount, category, date, paymentMethod, isDiscretionary } = req.body;

    try {
        const expense = await Expense.create({
            title,
            amount: parseFloat(amount) || 0,
            category,
            date: date || new Date(),
            paymentMethod: paymentMethod || 'Cash',
            isDiscretionary: isDiscretionary !== undefined ? isDiscretionary : true,
            userId: req.user.id
        });

        res.json(expense);
    } catch (err) {
        console.error('Error creating expense:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/expenses/scan-bill
// @desc    Scan receipt/bill image using Gemini AI
// @access  Private
router.post('/scan-bill', [auth, upload.single('bill')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload an image file.' });
        }

        console.log('📷 Processing uploaded receipt image for user:', req.user.id);
        
        const scannedData = await aiService.scanBill(req.file.buffer, req.file.mimetype);
        res.json(scannedData);
    } catch (err) {
        console.error('Error scanning bill:', err.message);
        res.status(500).json({ msg: 'AI Scan Failed: ' + err.message });
    }
});

// @route   POST api/expenses/categorize
// @desc    Smart expense categorization based on title
// @access  Private
router.post('/categorize', auth, async (req, res) => {
    const { title } = req.body;
    try {
        if (!title) {
            return res.status(400).json({ msg: 'Title is required' });
        }
        const category = await aiService.categorizeExpense(title);
        res.json({ category });
    } catch (err) {
        console.error('Error categorizing expense:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) return res.status(404).json({ msg: 'Expense not found' });

        // Make sure user owns expense
        if (expense.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await expense.destroy();

        res.json({ msg: 'Expense removed' });
    } catch (err) {
        console.error('Error deleting expense:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
