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

export const requireAdmin = requireRole('ADMIN');

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

const PLAN_ORDER = ['FREE', 'PRO', 'ENTERPRISE'];

/**
 * Require the requesting user's (or their organization's) plan to be at least
 * `minPlan`. Mirrors the client-side `hasPlan` logic in useAuthStore so gated
 * endpoints can't be bypassed by calling the API directly.
 * Usage: router.get('/endpoint', requirePlan('PRO'), handler)
 */
export const requirePlan = (minPlan) => {
  const minIndex = PLAN_ORDER.indexOf(minPlan.toUpperCase());
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const currentPlan = (req.user.orgPlan || req.user.plan || 'FREE').toUpperCase();
    if (PLAN_ORDER.indexOf(currentPlan) < minIndex) {
      return res.status(403).json({ message: `This feature requires the ${minPlan} plan or higher` });
    }
    next();
  };
};
