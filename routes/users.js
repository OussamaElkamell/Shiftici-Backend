import express from "express";
import {
  getAllUser,
  getMedecins,
  getMedecinsAvailable,
  getStructureUserInfo,
  RemoveProfile,

} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
/* READ */

router.get('/', getAllUser,verifyToken(["admin"]));
router.get('/medecins', getMedecins,verifyToken(["admin"]));
router.get('/medecins/available', getMedecinsAvailable,verifyToken(["admin"]));
/* UPDATE */
/* Delete */
router.delete ("/remove-profile/:id",RemoveProfile ,verifyToken)
export default router;
