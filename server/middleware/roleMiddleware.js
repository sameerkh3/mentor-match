/**
 * Factory middleware — restricts a route to specific roles.
 * Usage: router.get('/route', authMiddleware, requireRole('admin'), handler)
 *
 * @param  {...string} roles - Allowed roles (e.g. 'mentor', 'admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

export default requireRole;
