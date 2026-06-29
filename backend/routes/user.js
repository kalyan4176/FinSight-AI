const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get User Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update User Profile (Salary, Name, Currency, powerBiUrl, etc.)
router.put('/profile', auth, async (req, res) => {
    const { name, mobile, salary, currency, powerBiUrl } = req.body;
    const profileFields = {};
    if (name) profileFields.name = name;
    if (mobile) profileFields.mobile = mobile;
    if (salary !== undefined) profileFields.salary = parseFloat(salary) || 0;
    if (currency) profileFields.currency = currency;
    if (powerBiUrl !== undefined) profileFields.powerBiUrl = powerBiUrl;

    try {
        let user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await user.update(profileFields);

        // Get updated profile (without password)
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
