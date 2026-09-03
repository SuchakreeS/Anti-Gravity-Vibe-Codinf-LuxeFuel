import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import { AUTH_COOKIE_NAME } from '../utils/authCookie.js';

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user from DB to get role, plan and organizationId
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, email: true, name: true, role: true, plan: true, organizationId: true,
        organization: { select: { plan: true } },
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { organization, ...userFields } = user;
    req.user = { ...userFields, orgPlan: organization?.plan || null };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
