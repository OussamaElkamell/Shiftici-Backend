import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

import User from "../models/User.js";
import Medecin from "../models/medecin.js";
import Structure from "../models/Structure.js";
import Mission from "../models/Mission.js";
import { getUserLogin } from "./users.js";


export const registerUser = async (req, res) => {
  const {
    nom,
    prenom,
    nomStructure,
    telephone,
    email,
    mdp,
    role,
    picturePath,
    specialite,
    numeroOrdre,
    adresse,
    SIRET,
    type,
    mission
  } = req.body;

  try {
    if (!mdp) {
      return res.status(400).json({ msg: 'mdp (password) is required.' });
    }

    const hashedmdp = await bcrypt.hash(mdp, 10);

    // Create the base User document
    const newUser = await User.create({
      telephone,
      email,
      mdp: hashedmdp,
      role,
      picturePath,
    });

    // Handle role-specific logic
    let specificRecord;
    if (role === 'medecin') {
      specificRecord = await Medecin.create({
        user: newUser._id,
        nom,
        prenom,
        specialite,
        numeroOrdre,
        adresse,
        missions: []
      });

    } else if (role === 'structure') {
      specificRecord = await Structure.create({
        user: newUser._id,
        nomStructure,
        SIRET,
        type,
        adresse,
        missions: []
      });
    } else {
      return res.status(400).json({ msg: 'Invalid role specified.' });
    }

    // Create JWT token
    const tokenPayload = {
      id: newUser._id,
      role,
      isAdmin: newUser.isAdmin || false // Ensure isAdmin is defined
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    // Prepare user response data similar to login
    const userResponse = {
      _id: newUser._id,
      telephone: newUser.telephone,
      email: newUser.email,
      role: newUser.role,
      picturePath: newUser.picturePath,
      isActive: true,
      ...(role === 'medecin' ? specificRecord.toObject() : {}),
      ...(role === 'structure' ? specificRecord.toObject() : {})
    };

    // Respond with token and user details
    res.status(201).json({
      token,
      SpecificUser: userResponse // Match the key with the login response
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ msg: 'Error creating user.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, mdp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(mdp, user.mdp);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const SpecificUser = await getUserLogin(email);
    if (!SpecificUser) {
      return res.status(400).json({ msg: 'User details not found.' });
    }



    const tokenPayload = {
      id: SpecificUser.user,
      role: user.role,
      email:user.email,
      isAdmin: user.isAdmin || false
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    user.isActive = true;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      token,
      SpecificUser // Same structure as registerUser response
    });
  } catch (err) {
    console.error('Error in login method:', err.message);
    res.status(500).json({ msg: 'Login failed.', error: err.message });
  }
};

  
export const logout = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) return res.status(401).json({ msg: "No authentication token, authorization denied." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found." });

        user.isActive = false;
        user.lastLogout = new Date();
        await user.save();

        res.status(200).json({ msg: "User logged out successfully." });
    } catch (err) {
        console.error("Error in logout method:", err.message);
        res.status(500).json({ error: err.message });
    }
};

