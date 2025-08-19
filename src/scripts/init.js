
// scripts/init.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';

dotenv.config();

(async () => {
    try {
        // 1. Connect to admin DB
        const adminConn = new mongoose.mongo.MongoClient(process.env.MONGODB_ROOT_URL);
        await adminConn.connect();
        console.info('✅ Admin database connected.');

        // 2. Try to connect tenant DB
        try {
            const tenantConn = new mongoose.mongo.MongoClient(process.env.MONGO_URI);
            await tenantConn.connect();
            console.info('✅ Tenant DB connected.');
        } catch (error) {
            console.log("🚀 ~ error:", error)
            const db = adminConn.db("tenant");
            await db.command({
                createUser: "tenant",
                pwd: "tenant",
                roles: [
                    { role: 'dbAdmin', db: "tenant" },
                    { role: 'readWrite', db: "tenant" }
                ],
            });

            console.info('👤 Tenant DB user created.');
            // 3. Connect properly to tenant DB
            await mongoose.connect(process.env.MONGO_URI);
            console.info('📡 Connected to tenant database.');
        }

        // 4. Setup Tenant + Admin User
        let tenant = await Tenant.findOne({ name: 'DefaultTenant' });
        if (!tenant) {
            tenant = await Tenant.create({ name: 'DefaultTenant', plan: 'free' });
            console.log('🏢 Default tenant created.');
        }

        let admin = await User.findOne({ email: 'admin@saas.com' });
        if (!admin) {
            const passwordHash = await bcrypt.hash('Admin@123', 10);
            admin = await User.create({
                tenantId: tenant._id,
                name: 'Super Admin',
                email: 'admin@saas.com',
                passwordHash,
                role: 'admin',
            });
            console.log('👤 Admin user created: admin@saas.com / Admin@123');
        } else {
            console.log('Admin user already exists');
        }

        console.info('Default user created.');
        setTimeout(() => {
            // to ensure logger is finished logging before we exit the process
            process.exit(0);
        }, 1000);
        process.exit(0);
    } catch (error) {
        console.error('Error while executing init script', error);
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
})();