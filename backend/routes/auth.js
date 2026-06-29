const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');

// @route   POST api/auth/signup
// @desc    Register user with traditional signup and strict password rules
// @access  Public
router.post('/signup', async (req, res) => {
    const { name, mobile, email, username, password } = req.body;
    try {
        // Strict Password validation rules:
        // - At least 8 characters long
        // - Contains at least one uppercase letter
        // - Contains at least one lowercase letter
        // - Contains at least one number
        // - Contains at least one special character (!@#$%^&*)
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])");

        if (!password || password.length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
        }
        if (!strongRegex.test(password)) {
            return res.status(400).json({ msg: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)' });
        }

        if (!username || username.length < 3) {
            return res.status(400).json({ msg: 'Username must be at least 3 characters long' });
        }

        // Check if user already exists
        let user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email || '' },
                    { username: username || '' }
                ]
            }
        });
        if (user) {
            return res.status(400).json({ msg: 'User already exists (Email or Username)' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user in Sequelize
        user = await User.create({
            name,
            mobile,
            email,
            username,
            password: hashedPassword
        });

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error('Signup Error:', err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
