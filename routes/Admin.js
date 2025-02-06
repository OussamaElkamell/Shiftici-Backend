// routes/adminRoutes.js
import express from "express";
import { getContractPath, getMedecinsAdmin, getStructuresAdmin } from "../controllers/adminController.js";
import { getMissions } from "../controllers/mission.js";
import { verifyToken } from "../middleware/auth.js";



const router = express.Router();


// Protected route for the admin dashboard
router.get("/users/medecins",getMedecinsAdmin,verifyToken(["admin"]));
router.get("/users/structures",getStructuresAdmin,verifyToken(["admin"]));
router.get("/missions",getMissions,verifyToken(["admin"]));
router.get('/:missionId/contract', getContractPath,verifyToken);

export default router;
