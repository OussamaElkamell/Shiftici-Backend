import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifyToken = (requiredRoles) => async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findById(verified.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user's role matches one of the required roles
    if (!requiredRoles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Assign the found user to req.user for access in subsequent middleware/routes
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Error in verifyToken middleware:", err.message);
    res.status(500).json({ error: err.message });
  }
};
