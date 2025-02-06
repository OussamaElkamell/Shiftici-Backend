// missionRoutes.js
import express from "express"
import { AssignMedecin, createMission, deleteMission, dissociateDoctor, getContract, getDoctorById, getMedecinsByStructureId, getMissions, getUserMissions, handleRequestContract, updateContractFilePath, updateMission } from "../controllers/mission.js";
import multer from 'multer';
import path from 'path';
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets"); // Path to store contract files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
    },
});

const upload = multer({ storage });
// Route to create a new mission
router.get("/", getMissions,verifyToken(["admin"]));      
router.patch('/:missionId/upload-contract-signed', upload.single('contractFile'), updateContractFilePath,verifyToken(["admin"]));
router.post("/", upload.single("contractFile"), createMission,verifyToken(["structure"]));     // Create a new mission
router.patch("/:id",AssignMedecin ,verifyToken(["admin"]));     // assign a doctor 
router.patch("/:id/update", updateMission,verifyToken(["admin", "structure"]));  
router.delete("/:id", deleteMission,verifyToken(["admin", "structure"]));  // Delete a mission by ID
router.get("/:id/contract", getContract);
router.get("/:id/missions",getUserMissions);
router.get("/missions",getMissions);
router.get('/structures/:structureId/medecins', getMedecinsByStructureId);
router.patch("/:id/dissociate",dissociateDoctor,verifyToken(["admin", "structure"]));
router.patch('/:missionId/request-contract',handleRequestContract);
router.get('/:id/medecinsInfo', getDoctorById,verifyToken(["admin"])); 

export default router;
