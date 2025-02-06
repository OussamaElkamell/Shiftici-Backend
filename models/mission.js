import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
    nomStructure: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    contractFilePath: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    structureId: { type: mongoose.Schema.Types.ObjectId, ref: "Structure", required: true, default: null }, // Reference to the Structure
    medecinId: { type: mongoose.Schema.Types.ObjectId, ref: "Medecin" }, // Reference to the Medecin assigned
    medecinNom : { type: String },
    medecinPrenom : { type: String },
    medecinAdresse : { type: String },
    specialite: { type: String },
    
    statut: { 
        type: String,
        enum: ['En cours', 'Terminé', 'En attente', 'Contrat fait', 'contrat demandé'], // Enum values for mission status
        default: 'En attente' // Default value
    },
    budget: { type: Number, required: true },
    Approved: { type: Boolean, required: true, default: false },
    currency:{ type: String, required: true },
    signatureRequestId:{ type: String }
}, { timestamps: true }); // Add timestamps option here

const Mission = mongoose.model("Mission", missionSchema);
export default Mission;
