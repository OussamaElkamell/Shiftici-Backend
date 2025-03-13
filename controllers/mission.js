import path from "path";
import fs from "fs";
import Structure from "../models/structure.js";
import Mission from "../models/mission.js";
import Medecin from "../models/medecin.js";
import User from "../models/user.js";
import Notification from "../models/Notification.js";

// Create a new mission
export const createMission = async (req, res) => {
    try {
        const {
            nomStructure,
            title,
            description,
            startDate,
            endDate,
            structureId,
            budget,
            specialite,
            currency,
            statut = "Contrat fait", // Default status
            signatureRequestId
        } = req.body;

        // Validate required fields
        if (!nomStructure || !title || !description || !startDate || !endDate || !structureId) {
            return res.status(400).json({ error: "Tous les champs requis doivent être remplis." });
        }

        // Handle the contract file
        const contractFilePath = req.file.path; // Get the path of the uploaded file

        // Create a new mission instance
        const newMission = new Mission({
            nomStructure,
            title,
            description,
            startDate,
            endDate,
            structureId,
            statut:statut,
            budget,
            specialite,
            currency,
            contractFilePath, // Save the contract file path
            signatureRequestId
        });
        const structure = await Structure.findOne({ user: structureId }); 
      
        
        // Save the mission to the database
        const savedMission = await newMission.save();
    
        
        await Structure.findByIdAndUpdate(
            structure._id, // Use the structure's ID found from the previous query
            { $push: { missions: savedMission } }, 
            { new: true } // Return the updated document
        );
        res.status(201).json(savedMission);
    } catch (error) {
        console.error("Erreur lors de la création de la mission:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};


export const updateContractFilePath = async (req, res) => {
    try {
        const { missionId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        // Construct the new file path
        const newFilePath = `public/assets/${req.file.filename}`;

        // Find the mission and update its contractFilePath
        const mission = await Mission.findByIdAndUpdate(
            missionId,
            { contractFilePath: newFilePath },
            { new: true }
        );

        if (!mission) {
            // Delete the uploaded file if mission not found
            fs.unlinkSync(newFilePath);
            return res.status(404).json({ message: "Mission not found." });
        }

        res.status(200).json({
            message: "Contract file uploaded and path updated successfully.",
            mission,
        });
    } catch (error) {
        console.error("Error updating contract file path:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Get all missions
export const getMissions = async (req, res) => {
    try {
        const missions = await Mission.find();
        res.status(200).json(missions);
    } catch (error) {
        console.error("Erreur lors de la récupération des missions:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// Get user missions
export const getUserMissions = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the user and their associated structures or medecins
        const user = await User.findById(id);
       
        const structure = await Structure.findOne({ user: id }).populate('missions', "budget title description startDate endDate statut medecinId medecinNom medecinPrenom medecinAdresse updatedAt specialite");
        const medecin = await Medecin.findOne({ user: id }).populate('missions', "nomStructure budget title description startDate endDate statut structureId updatedAt signatureRequestId specialite");

        let sortedMissions;
        let averageBudget = 0; // Default value for structure users

        if (user.role === "structure") {
            if (!structure) {
                return res.status(404).json({ error: "Structure not found." });
            }
            if (!structure.missions || structure.missions.length === 0) {
                return res.status(404).json({ error: "No missions found for this structure." });
            }
            sortedMissions = structure.missions.sort((a, b) => b.updatedAt - a.updatedAt);
        } 
        
        if (user.role === "medecin") {
            if (!medecin) {
                return res.status(404).json({ error: "Medecin not found." });
            }
            if (!medecin.missions || medecin.missions.length === 0) {
                return res.status(404).json({ error: "No missions found for this medecin." });
            }

            sortedMissions = medecin.missions.sort((a, b) => b.updatedAt - a.updatedAt);
            
            // Calculate average budget for completed missions
            const completedMissions = medecin.missions.filter(mission => mission.statut === 'Contrat terminé');
            const totalBudget = completedMissions.reduce((acc, mission) => acc + mission.budget, 0);
            averageBudget = completedMissions.length > 0 ? totalBudget / completedMissions.length : 0;

            // Update the average budget in the Medecin model
            await Medecin.findByIdAndUpdate(
                medecin._id,
                { averageBudget },
                { new: true }
            );
        }

        // Return the unified response structure
        return res.status(200).json({ missions: sortedMissions, averageBudget });

    } catch (error) {
        console.error("Erreur lors de la récupération des missions:", error);
        res.status(500).json({ 
            error: "Erreur interne du serveur.", 
            details: error.message 
        });
    }
};




// Get the contract PDF of a mission by ID
export const getContract = async (req, res) => {
    try {
        const { id } = req.params;

        const mission = await Mission.findById(id);

        if (!mission || !mission.contractFilePath) {
            return res.status(404).json({ error: "Contrat non trouvé." });
        }

        const filePath = path.resolve(mission.contractFilePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Le fichier de contrat est introuvable." });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error("Erreur lors de la récupération du contrat:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// Get doctors collaborating with a specific structure
export const getMedecinsByStructureId = async (req, res) => {
    try {
        const { structureId } = req.params; // Get structureId from request parameters
    
        
        // Fetch doctors associated with the given structureId
        const medecins = await Medecin.find({ structureId: structureId }); // Adjust the query as necessary

        if (!medecins.length) {
            return res.status(404).json({ message: "No doctors found for this structure." });
        }

        res.status(200).json(medecins);
    } catch (error) {
        console.error("Erreur lors de la récupération des médecins:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};


// Update the medecinId for a mission
export const AssignMedecin = async (req, res) => {
    try {
        const { id } = req.params;
        const { medecinId } = req.body; // Extract medecinId from request body

        if (!medecinId) {
            return res.status(400).json({ error: "medecinId is required." });
        }

        // Find the Medecin by user reference
        const medecin = await Medecin.findOne({ _id: medecinId });
        if (!medecin) {
            return res.status(404).json({ error: "Medecin not found." });
        }
       
        
        // Update the mission with medecinId and the Medecin details (nom, prenom, adresse)
        const updatedMission = await Mission.findByIdAndUpdate(
            id,
            { 
                medecinId, 
                medecinNom: medecin.nom, 
                medecinPrenom: medecin.prenom, 
                medecinAdresse: medecin.adresse 
            },
            { new: true, runValidators: true } // Return the updated mission
        );

        if (!updatedMission) {
            return res.status(404).json({ error: "Mission not found." });
        }

        // Push the updated mission into the Medecin's missions array
        await Medecin.findByIdAndUpdate(
            medecin._id,
            { $push: { missions: updatedMission._id } }, // Push the mission ID into the Medecin's missions array
            { new: true }
        );

        // Optionally, send a notification about the new mission assignment
        await Notification.create({ 
            medecinId, 
            message: "You have been assigned to a new mission." 
        });

        res.status(200).json(updatedMission);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du medecinId de la mission:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

export const dissociateDoctor = async (req, res) => {
    const { medecinId } = req.body;
    const AdminID="67294fb3764e62390b31ab3e"
    try {
        // Fetch the mission using the mission ID
        const mission = await Mission.findById(req.params.id);
        if (!mission) {
            return res.status(404).json({ message: "Mission not found." });
        }

        // Check if the mission has an associated doctor
        if (!mission.medecinId || mission.medecinId.toString() !== medecinId) {
            return res.status(400).json({ message: "This doctor is not assigned to this mission." });
        }

        // Fetch the Medecin by the associated medecinId
        const medecin = await Medecin.findOne({user:mission.medecinId});
        if (!medecin) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        // Remove the mission reference from the doctor's missions array
        medecin.missions = medecin.missions.filter((id) => id.toString() !== mission._id.toString());

        // Save the updated doctor
        await medecin.save();

        // Remove medecinId from the mission using $unset and change the status
        await Mission.findByIdAndUpdate(
            mission._id,
            { $unset: { medecinId: "", medecinNom:"" ,medecinPrenom:"",medecinAdresse:"" }, statut: "Contrat fait" },
            { new: true } // Return the updated mission
        );

        return res.status(200).json({ message: "Doctor dissociated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while dissociating the doctor." });
    }
};

export const handleRequestContract = async (req, res) => {
    const { missionId } = req.params; // Get the mission ID from the request parameters
    const { statut } = req.body; // Get the status from the request body

    try {
        // Validate ObjectId
        if (!missionId) {
            return res.status(400).json({ error: "Invalid mission ID" });
        }

        // Find the mission by ID and update its status
        const updatedMission = await Mission.findByIdAndUpdate(
            missionId,
            { statut: statut }, // Update the statut field
            { new: true } // Return the updated document
        );

        // Check if the mission was found and updated
        if (!updatedMission) {
            return res.status(404).json({ error: "Mission not found" });
        }

        // Send back the updated mission
        return res.status(200).json(updatedMission);
    } catch (error) {
        console.error("Error updating mission:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const getDoctorById = async (req, res) => {
    const doctorId = req.params.id; // Get the doctor ID from the URL parameters


    try {
        const doctor = await Medecin.findOne({user:doctorId}).populate('user', 'email telephone');
        
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' }); // Return 404 if not found
        }
        res.status(200).json(doctor); // Return the doctor data if found
    } catch (error) {
        console.error("Error fetching doctor info:", error);
        res.status(500).json({ message: 'Server error' }); // Handle server errors
    }
};
export const updateMission = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMission = await Mission.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedMission) {
            return res.status(404).json({ error: "Mission introuvable." });
        }

        res.status(200).json(updatedMission);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la mission:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// Delete a mission by ID
export const deleteMission = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the mission to get the medecinId before deletion
        const mission = await Mission.findById(id);
        if (!mission) {
            return res.status(404).json({ error: "Mission introuvable." });
        }

        // Find the medecin associated with the mission (by user reference)
        const medecin = await Medecin.findOne({ user: mission.medecinId });
        if (medecin) {
            // Remove the mission ID from the medecin's missions array
            await Medecin.findByIdAndUpdate(
                medecin._id,
                { $pull: { missions: id } },
                { new: true }
            );
        }

        // Delete the mission
        await Mission.findByIdAndDelete(id);

        res.status(200).json({ message: "Mission supprimée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de la mission:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
