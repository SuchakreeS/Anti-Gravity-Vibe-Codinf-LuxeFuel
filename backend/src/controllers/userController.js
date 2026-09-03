import { handleError } from '../utils/errorHandler.js';
import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, name: true, email: true, role: true, plan: true,
        organizationId: true, createdAt: true, updatedAt: true,
        organization: { select: { id: true, name: true, plan: true } }
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      organizationId: user.organizationId,
      organizationName: user.organization?.name || null,
      orgPlan: user.organization?.plan || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updateData = {};

    if (data.name) updateData.name = data.name;

    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = data.email;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { 
        id: true, name: true, email: true, role: true, plan: true,
        organizationId: true, createdAt: true, updatedAt: true,
        organization: { select: { id: true, name: true, plan: true } }
      }
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      plan: updated.plan,
      organizationId: updated.organizationId,
      organizationName: updated.organization?.name || null,
      orgPlan: updated.organization?.plan || null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    handleError(res, error);
  }
};
