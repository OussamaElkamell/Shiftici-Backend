// controllers/notificationsController.js

import Notification from "../models/Notification.js";

// Get notifications for a specific user
export const getNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
  
    const notifications = await Notification.findOne({ medecinId:userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};
export const resetNotifications = async (req, res) => {
    try {
      const userId = req.params.userId;
      await Notification.updateMany({ userId, viewed: false }, { viewed: true });
      res.sendStatus(200);
    } catch (error) {
      console.error("Error resetting notifications:", error);
      res.status(500).json({ message: "Failed to reset notifications" });
    }
  };
