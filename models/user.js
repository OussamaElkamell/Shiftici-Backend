import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    telephone: { type: String },
    email: { type: String, unique: true, lowercase: true, trim: true },
    mdp: { type: String },
    role: { type: String, enum: ['medecin', 'structure','admin'] },
    isActive: { type: Boolean, default: true },
    inColaboration: { type: Boolean, default: false },
    lastLoginDate: { type: Date, default: null },
    creationAccountDate: { type: Date, default: Date.now },
    isAdmin :{ type: Boolean, default: false },
  

});

const User = mongoose.model("User", userSchema);
export default User;
