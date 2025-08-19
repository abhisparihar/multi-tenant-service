import express from 'express';
import User from '../models/User.js';
import { authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Get users (Admin/Manager only)
router.get('/', authorizeRoles('admin', 'manager'), async (req, res) => {
    console.log(req.user);

    const users = await User.find({ tenantId: req.user.tenantId });
    res.json(users);
});

// Create user (Admin only)
router.post('/', authorizeRoles('admin'), async (req, res) => {
    const { name, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        tenantId: req.user.tenantId,
        name,
        email,
        passwordHash,
        role,
    });
    res.json(user);
});

export default router;