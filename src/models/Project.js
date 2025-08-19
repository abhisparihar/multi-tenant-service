import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'archived'],
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Project', projectSchema);
