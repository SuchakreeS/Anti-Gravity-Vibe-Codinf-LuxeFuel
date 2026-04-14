import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const createMemberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export const getOrganization = async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      include: {
        _count: { select: { users: true, cars: true } }
      }
    });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { organizationId: req.user.organizationId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const { email, password, name } = createMemberSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user',
        organizationId: req.user.organizationId
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    
    // Cannot remove yourself
    if (memberId === req.user.id) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    const member = await prisma.user.findFirst({
      where: { id: memberId, organizationId: req.user.organizationId }
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.role === 'admin') {
      return res.status(400).json({ message: 'Cannot remove an admin' });
    }

    // Delete user's personal cars and their fuel records, then user
    await prisma.$transaction(async (tx) => {
      // Get user's personal cars
      const personalCars = await tx.car.findMany({
        where: { userId: memberId, isPersonal: true }
      });

      for (const car of personalCars) {
        await tx.fuelRecord.deleteMany({ where: { carId: car.id } });
        await tx.car.delete({ where: { id: car.id } });
      }

      // Remove submittedBy references from fuel records
      await tx.fuelRecord.updateMany({
        where: { submittedById: memberId },
        data: { submittedById: null }
      });

      await tx.user.delete({ where: { id: memberId } });
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
