import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import { authMiddleware } from './middlewares/auth.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import logger from "./utils/logger.js";
import morgan from "morgan";


dotenv.config();

const app = express();
app.use(express.json());

// Morgan logs HTTP requests and pipes them to Winston
app.use(morgan("combined", { stream: logger.stream }));

// Redis client
export const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));
await redisClient.connect();

// Routes
app.use('/auth', authRoutes);
app.use('/users', authMiddleware, rateLimiter, userRoutes);
app.use('/projects', authMiddleware, rateLimiter, projectRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

// Catch unhandled errors
app.use((err, req, res, next) => {
    logger.error(`Error in ${req.method} ${req.url}: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));

/**
* Catch uncaught exceptions and unhandled rejections
*/
process.on("uncaughtException", (err) => {
    logger.error("❌ Uncaught Exception:", err);
    process.exit(1); // exit to avoid unknown state
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});