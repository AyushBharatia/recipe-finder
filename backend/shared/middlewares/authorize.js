/**
 * Role-based authorization middleware factory
 * Creates middleware that checks if user has required role(s)
 *
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 *
 * @example
 * // Allow only admins
 * router.delete('/users/:id', protect, authorize('admin'), deleteUser);
 *
 * // Allow admins and moderators
 * router.put('/posts/:id', protect, authorize('admin', 'moderator'), updatePost);
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    // Ensure user is authenticated first (protect middleware should run before this)
    if (!req.user) {
      return res.status(401).json({
        message: "Access denied. Authentication required.",
      });
    }

    // Check if user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
}

module.exports = { authorize };
