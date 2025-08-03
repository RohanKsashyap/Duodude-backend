import jwt  from "jsonwebtoken";
import User  from "../models/User.js";

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  
  console.log("Auth middleware - Authorization header:", auth ? "Present" : "Missing");
  
  if (auth && auth.startsWith("Bearer")) {
    try {
      const token = auth.split(" ")[1];
      console.log("Auth middleware - Token extracted:", token ? "Present" : "Missing");
      
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET environment variable is not set!");
        return res.status(500).json({ message: "Server configuration error" });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Auth middleware - Token decoded successfully, user ID:", decoded.id);

      // Fetch user without password
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        console.log("Auth middleware - User not found in database:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }

      console.log("Auth middleware - User authenticated:", req.user._id);
      next();
    } catch (err) {
      console.error("Auth middleware - Token verification failed:", err.message);
      res.status(401).json({
        message: "Not authorized, token failed",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  } else {
    console.log("Auth middleware - No valid authorization header");
    res.status(401).json({ message: "No token, authorization denied" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};
