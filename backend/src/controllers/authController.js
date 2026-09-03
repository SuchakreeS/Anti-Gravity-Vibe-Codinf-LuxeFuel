import { handleError } from '../utils/errorHandler.js';
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from '../utils/authCookie.js';
import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const registerOrgSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  organizationName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(true),
});

export const register = async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: 'INDIVIDUAL' }
    });
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    handleError(res, error);
  }
};

export const registerOrganization = async (req, res) => {
  try {
    const { email, password, name, organizationName } = registerOrgSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const existingOrg = await prisma.organization.findUnique({ where: { name: organizationName } });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization name already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: organizationName }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
          organizationId: org.id
        }
      });

      return { org, user };
    });

    res.status(201).json({ 
      message: 'Organization registered successfully',
      organization: result.org.name
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    handleError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: { select: { id: true, name: true, plan: true } } }
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '3d' });
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions(rememberMe));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || null,
        orgPlan: user.organization?.plan || null
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    handleError(res, error);
  }
};

export const logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions());
  res.json({ message: 'Logged out' });
};

export const me = async (req, res) => {
  // authMiddleware has already loaded and validated req.user from the cookie.
  res.json({ user: req.user });
};
