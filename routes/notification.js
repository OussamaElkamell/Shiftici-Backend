// routes/notificationsRouter.js

import express from "express";
import { getNotifications, resetNotifications } from "../controllers/notification.js";


const router = express.Router();

// Route to get notifications by user ID
router.get("/:userId",getNotifications);
router.post("/:userId/reset", resetNotifications);

export default router;
