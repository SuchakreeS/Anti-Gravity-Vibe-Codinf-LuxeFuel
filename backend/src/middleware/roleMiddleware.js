/**
 * Role-based access control middleware.
 * Usage: router.post('/endpoint', requireRole('admin'), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export const requireAdmin = requireRole('admin');

/**
 * Require that the user belongs to an organization (admin or user role).
 */
export const requireOrgMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!req.user.organizationId) {
    return res.status(403).json({ message: 'Not a member of any organization' });
  }
  next();
};
