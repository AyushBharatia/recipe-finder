const { verifyToken } = require("../utils/jwt");
const UserModel = require("../../modules/auth/auth-model");


// Optional auth - attaches user if token valid, but doesn't reject if not
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.userId).select("-password");
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Token invalid - just continue without user
    next();
  }
}

// Attaches authenticated user to req.user
async function protect(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided or invalid format. Use 'Bearer <token>'",
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database (exclude password)
    const user = await UserModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Access denied. User not found",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      message: "Access denied. Invalid or expired token",
    });
  }
}

module.exports = { protect, optionalAuth };
