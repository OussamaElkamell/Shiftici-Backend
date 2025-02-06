// models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true, trim: true },
    mdp: { type: String, required: true },
    isAdmin :{ type: Boolean, default: true },
});

// Hash the mdp before saving
AdminSchema.pre('save', async function(next) {
    if (!this.isModified('mdp')) return next();
    this.mdp = await bcrypt.hash(this.mdp, 10);
    next();
});

// Method to compare mdps
AdminSchema.methods.comparemdp = function(mdp) {
    return bcrypt.compare(mdp, this.mdp);
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
