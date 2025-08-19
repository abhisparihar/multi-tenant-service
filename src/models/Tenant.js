import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        plan: {
            type: String,
            enum: ['free', 'pro'],
            default: 'free'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Tenant', tenantSchema);