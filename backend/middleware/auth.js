const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to verify JWT Token
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.id; // Support direct 'id' header

    if (!token) {
      // Fallback: Check for Authorization Bearer header
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
    }

    if (!token || !/^[0-9a-fA-F]{24}$/.test(token)) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid or missing user ID token format."
      });
    }

    // Fetch user directly using the token (which is the userId)
    const user = await User.findById(token).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Invalid user ID token."
      });
    }

    // Check verification status for students (allow GET viewing, block booking mutations if not approved)
    if (user.role === "student" && user.verificationStatus !== "approved") {
      if (req.method !== "GET") {
        return res.status(403).json({
          success: false,
          message: `Account pending HOD verification. Booking requests will be enabled once your HOD approves your account.`
        });
      }
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Access denied. Invalid user ID token.",
      error: error.message
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'hod', 'labasist', 'student')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please authenticate first."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
