import Medecin from "../models/Medecin.js";
import Mission from "../models/Mission.js";
import Structure from "../models/Structure.js";

export const getMedecinsAdmin = async (req, res) => {
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
  export const getContractPath = async (req, res) => {
    const { missionId } = req.params; // Get the mission ID from request parameters


    try {
        // Find the mission by ID
        const mission = await Mission.findById(missionId);
        if (!mission) {
            return res.status(404).json({ message: "Mission not found" });
        }

        // Send the contract file path as the response
        return res.json({ contractFilePath: mission.contractFilePath });
    } catch (error) {
        console.error("Error fetching contract path:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

  export const getStructuresAdmin = async (req, res) => {
    try {
      // Find all doctors and populate the associated user data
      const structures = await Structure.find().populate('user', 'nom prenom telephone email');
  
      // Check if doctors were found
      if (!structures.length) {
        return res.status(404).json({ message: 'No structures found' });
      }
  
      res.status(200).json(structures);
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