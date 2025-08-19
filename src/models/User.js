import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'employee'],
            default: 'employee'
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model('User', userSchema);