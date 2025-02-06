import mongoose from "mongoose";

// Define the Medecin schema
const medecinSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    specialite: { type: String, required: true },
    numeroOrdre: { type: String, required: true },
    adresse: { type: String, required: true },
    missions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mission" }],
    structureId: { type: mongoose.Schema.Types.ObjectId, ref: "Structure"}, // Reference to the Structure
    overallRating: {
        type: Number,
        default: 0, // Default value in case no rating is present
    },
    averageBudget: { type: Number, default: 0 } 
    
 
}, { timestamps: true }); // Add timestamps if needed

// Create the Medecin model using the schema
const Medecin = mongoose.model("Medecin", medecinSchema);

export default Medecin;
