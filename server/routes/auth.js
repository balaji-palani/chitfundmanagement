const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

const authenticateToken = require('../middleware/auth');

// Register (Protected: Admin only)
router.post('/register', authenticateToken, async (req, res) => {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { username, password, role } = req.body; // Allow setting role
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const userRole = role || 'user'; // Default to 'user'

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
            [username, hashedPassword, userRole]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (await bcrypt.compare(password, user.password_hash)) {
            // Include role in token
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, username: user.username, role: user.role });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
