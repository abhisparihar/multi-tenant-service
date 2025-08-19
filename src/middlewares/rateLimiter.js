import { redisClient } from '../app.js';
import Tenant from '../models/Tenant.js';

// Define rate limits per tenant plan
const RATE_LIMITS = {
    free: { limit: 100, window: 60 },   // 100 requests per minute
    pro: { limit: 1000, window: 60 },  // 1000 requests per minute
};

export const rateLimiter = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId.toString();
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) return res.status(403).json({ message: 'Tenant not found' });

        const { limit, window } = RATE_LIMITS[tenant.plan] || RATE_LIMITS.free;
        const key = `rate:${tenantId}:${Math.floor(Date.now() / (window * 1000))}`;

        const count = await redisClient.incr(key);
        if (count === 1) {
            await redisClient.expire(key, window);
        }

        if (count > limit) {
            return res.status(429).json({ message: 'Rate limit exceeded. Upgrade your plan.' });
        }

        next();
    } catch (err) {
        console.error('RateLimiter Error:', err);
        return res.status(500).json({ message: 'Rate limiting failed' });
    }
};