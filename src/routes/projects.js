import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// Get projects (all roles)
router.get('/', async (req, res) => {
    const projects = await Project.find({ tenantId: req.user.tenantId });
    res.json(projects);
});

// Create project (Admin/Manager)
router.post('/', async (req, res) => {
    const { name } = req.body;
    const project = await Project.create({
        tenantId: req.user.tenantId,
        name,
        createdBy: req.user._id,
    });
    res.json(project);
});

export default router;