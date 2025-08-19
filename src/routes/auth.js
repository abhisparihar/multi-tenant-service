import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { redisClient } from '../app.js';
import validate from "../middlewares/validate.js";
import { Login, Register } from "../validations/auth-schema.js";
import logger from '../utils/logger.js';

const router = express.Router();

// Register tenant + admin
router.post('/register', validate(Register), async (req, res) => {
    try {
        const { tenantName, name, email, password } = req.body;
        const tenant = await Tenant.create({ name: tenantName });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            tenantId: tenant._id,
            name,
            email,
            passwordHash,
            role: 'admin',
        });

        res.json({ tenant, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// login
router.post('/login', validate(Login), async (req, res) => {
    try {
        const { email, password } = req.body;
        logger.info("Login attempt", { email: req.body.email });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Store refresh token in Redis
        await redisClient.set(`refresh:${user._id}`, refreshToken, { EX: 7 * 24 * 60 * 60 });

        res.json({ token, refreshToken });
    } catch (err) {
        logger.error("Login failed", { error: error.message });
        res.status(500).json({ message: err.message });
    }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const storedToken = await redisClient.get(`refresh:${decoded.id}`);

        if (!storedToken || storedToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = jwt.sign({ id: decoded.id, tenantId: decoded.tenantId }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ token: newAccessToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token provided' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await redisClient.del(`refresh:${decoded.id}`);
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
});

export default router;
