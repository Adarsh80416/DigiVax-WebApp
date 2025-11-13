import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ message: "Unauthorized - No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        id: user._id.toString(),
        userId: user._id.toString(),
        role: user.role,
        email: user.email
      };

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied - Insufficient permissions" });
      }

      // Check if doctor is approved (only for doctor role routes)
      if (user.role === "doctor" && !user.isApproved) {
        return res.status(403).json({ 
          message: "Access denied - Doctor account is not approved yet" 
        });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
