import mongoose from 'mongoose';

// Define the Evaluation schema
const EvaluationSchema = new mongoose.Schema({
    mission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mission',
        required: true,
    },
    evaluator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The evaluator (doctor or structure)
        required: true,
    },
    evaluatee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The person or structure being evaluated
        required: true,
    },
    role: {
        type: String, // Role of the evaluator ("doctor" or "structure")
        enum: ["medecin", "structure"],
        required: true,
    },
    punctuality: { type: Number, required: true, min: 0, max: 5 ,default:0},
    competence: { type: Number, required: true, min: 0, max: 5,default:0 },
    communication: { type: Number, required: true, min: 0, max: 5,default:0 },
    overallEvaluation : { type: Number, required: true, min: 0, max: 5,default:0 },
    comment: { type: String },
}, { timestamps: true });

const Evaluation = mongoose.model('Evaluation', EvaluationSchema);
export default Evaluation;
