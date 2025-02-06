import mongoose from 'mongoose';

// Define the Structure schema
const StructureSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    nomStructure: {
        type: String,
        required: true,
    },
    SIRET: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
    },
    adresse: {
        type: String,
        required: true,
    },
    missions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mission', // Reference to the Mission model
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    overallRating: {
        type: Number,
        default: 0, // Default value in case no rating is present
    },
}, { timestamps: true }); // Add timestamps option here

// Create the Structure model
const Structure = mongoose.model('Structure', StructureSchema);

export default Structure;
