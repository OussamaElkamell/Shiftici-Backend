import Structure from "../models/Structure.js";
import User from "../models/user.js";
import Medecin from "../models/medecin.js"; // Import Medecin model

/* READ */


export const getUserLogin = async (email) => {
  try {
    // Fetch user by email in the User collection
    let SpecificUser = await User.findOne({ email });
    if (!SpecificUser) {
      throw new Error('No user found');
    }
    
   
    // Check user role and fetch details accordingly
    if (SpecificUser.role === "structure") {
      SpecificUser = await Structure.findOne({ user: SpecificUser._id }).populate({
        path: "user", // Populate the user, which includes the role field in the User schema
        select: "role email"
      });
      console.log(SpecificUser);
      
    } else if (SpecificUser.role === "medecin"){
      SpecificUser = await Medecin.findOne({ user: SpecificUser._id })
      .populate({
        path: "user", // Populate the user, which includes the role field in the User schema
        select: "role email",
      });
    
    }
    
  
    let user
    if (!SpecificUser && SpecificUser.role!="admin" ) {
      throw new Error('No additional details found for this user');
    
  }user=SpecificUser
  
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};


export const getMedecinsAvailable = async (req, res) => {
  try {
    // Find all doctors who have no missions in the `missions` array
    const medecins = await Medecin.find({ missions: { $exists: true, $size: 0 } })
      .populate('user', 'nom prenom telephone email averageBudget')

    // Check if doctors were found
    if (medecins.length === 0) {
      return res.status(404).json({ message: 'No available doctors found' });
    }

    res.status(200).json(medecins);
  } catch (err) {
    console.error(err); // Log the error for debugging

    // Handle specific error cases
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid request format' });
    } else if (err.name === 'ValidationError') {
      return res.status(422).json({ message: 'Validation failed', errors: err.errors });
    } else {
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }
};


export const getMedecins = async (req, res) => {
  try {
    // Find all doctors and populate the associated user data
    const medecins = await Medecin.find().populate('user', 'nom prenom telephone email role isActive');

    // Check if doctors were found
    if (!medecins.length) {
      return res.status(404).json({ message: 'No doctors found' });
    }

    res.status(200).json(medecins);
  } catch (err) {
    console.error(err); // Log the error for debugging

    // Handle specific error cases
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid request format' });
    } else if (err.name === 'ValidationError') {
      return res.status(422).json({ message: 'Validation failed', errors: err.errors });
    } else {
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }
};



export const getAllUser = async (req, res) => {
  try {
    const user = await User.find()
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const getStructureUserInfo = async (req, res) => {
  const { id } = req.params; // Extract the user ID from the request parameters
console.log("id:",id);

  try {
      // Find the basic user information by ID and populate missions
      const basicInformation = await User.findById(id).populate('missions');

      // Check if the user exists
      if (!basicInformation) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Find the specific information in the Structure model using the user reference
      const specificInformation = await Structure.findOne({ user: id }); // Ensure to reference correctly

      // Combine both basic and specific information into a single object
      const user = {
          _id: basicInformation._id,
          telephone: basicInformation.telephone,
          email: basicInformation.email,
          role: basicInformation.role,
          isActive: basicInformation.isActive,
          lastLoginDate: basicInformation.lastLoginDate,
          creationAccountDate: basicInformation.creationAccountDate,
          nomStructure: specificInformation ? specificInformation.nomStructure : null,
          SIRET: specificInformation ? specificInformation.SIRET : null,
          type: specificInformation ? specificInformation.type : null,
          adresse: specificInformation ? specificInformation.adresse : null,
          missions: specificInformation ? specificInformation.missions : [], // Can also populate missions if needed
      };

      // Return the combined user document
      return res.status(200).json(user);
  } catch (error) {
      console.error('Error fetching structure user info:', error.message);
      return res.status(500).json({ error: 'Error fetching structure user info', message: error.message });
  }
};
export const getAllStructures = async (req, res) => {
  try {
      const structures = await Structure.find()
          .populate('user') // Populate the user reference

      return res.status(200).json(structures);
  } catch (error) {
      console.error('Error retrieving structures:', error.message);
      return res.status(500).json({ error: 'Error retrieving structures.', message: error.message });
  }
};
export const RemoveProfile = async (req, res) => {
  const { id } = req.params;

  try {
    await User.deleteOne({ _id: id });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};


