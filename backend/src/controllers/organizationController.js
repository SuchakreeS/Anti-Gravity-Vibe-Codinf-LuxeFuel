import { handleError } from '../utils/errorHandler.js';
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
    handleError(res, error);
  }
};

export const getMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { organizationId: req.user.organizationId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 1000 // defensive cap; no UI paginates this list today
    });
    res.json(members);
  } catch (error) {
    handleError(res, error);
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
        role: 'USER',
        organizationId: req.user.organizationId
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    handleError(res, error);
  }
};

export const removeMember = async (req, res) => {
  try {
    const memberId = parseInt(req.params.id, 10);
    if (Number.isNaN(memberId)) {
      return res.status(400).json({ message: 'Invalid member id' });
    }

    if (memberId === req.user.id) {
      return res.status(400).json({ message: 'You cannot remove yourself' });
    }

    const member = await prisma.user.findFirst({
      where: { id: memberId, organizationId: req.user.organizationId },
    });
    if (!member) {
      return res.status(404).json({ message: 'Member not found in your organization' });
    }

    if (member.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { organizationId: req.user.organizationId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin of the organization' });
      }
    }

    // No cascading/SetNull rule is defined on Car/FuelRecord/AuditLog -> User in the
    // schema, so a hard delete would fail on the FK constraint if the member has any
    // history. Block with a clear message instead of letting Prisma throw.
    const [carCount, recordCount, logCount] = await Promise.all([
      prisma.car.count({ where: { userId: memberId } }),
      prisma.fuelRecord.count({ where: { submittedById: memberId } }),
      prisma.auditLog.count({ where: { userId: memberId } }),
    ]);
    if (carCount > 0 || recordCount > 0 || logCount > 0) {
      return res.status(409).json({
        message: 'This member has cars, fuel records, or audit history and cannot be removed. Reassign or delete their data first.',
      });
    }

    await prisma.user.delete({ where: { id: memberId } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'User',
        entityId: memberId,
        userId: req.user.id,
        organizationId: req.user.organizationId,
        details: JSON.stringify({ removedEmail: member.email, removedName: member.name }),
      },
    });

    res.json({ message: 'Member removed' });
  } catch (error) {
    handleError(res, error);
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    // Get org users first (cheap) instead of pulling every fuel record for
    // every user into memory.
    const users = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, role: true }
    });
    const userIds = users.map(u => u.id);

    if (userIds.length === 0) return res.json([]);

    // Aggregate totals per user in the DB instead of summing in Node.
    const [totals, greenCounts, recentLogsByUser] = await Promise.all([
      prisma.fuelRecord.groupBy({
        by: ['submittedById'],
        where: { submittedById: { in: userIds } },
        _sum: { carbonEmitted: true, distanceTraveled: true, consumptionRate: true },
        _count: { _all: true }
      }),
      prisma.fuelRecord.groupBy({
        by: ['submittedById'],
        where: { submittedById: { in: userIds }, fuelType: { in: ['E20', 'E85'] } },
        _count: { _all: true }
      }),
      Promise.all(users.map(user =>
        prisma.fuelRecord.findMany({
          where: { submittedById: user.id },
          include: { car: { select: { name: true, brand: true } } },
          orderBy: { date: 'desc' },
          take: 5
        })
      ))
    ]);

    const totalsByUser = new Map(totals.map(t => [t.submittedById, t]));
    const greenByUser = new Map(greenCounts.map(g => [g.submittedById, g._count._all]));
    const recentByUser = new Map(users.map((user, i) => [user.id, recentLogsByUser[i]]));

    const leaderboard = users.map(user => {
      const t = totalsByUser.get(user.id);
      const logCount = t?._count._all || 0;
      const totalCO2 = t?._sum.carbonEmitted || 0;
      const totalDist = t?._sum.distanceTraveled || 0;

      // Matches the original semantics: null consumptionRate counts as 0,
      // divided by the total record count (not just non-null records).
      const avgEfficiency = logCount > 0 ? (t?._sum.consumptionRate || 0) / logCount : 0;

      const greenLogs = greenByUser.get(user.id) || 0;
      const greenAdoption = logCount > 0 ? (greenLogs / logCount) * 100 : 0;

      const pulseScore = Math.round(Math.min(100, (avgEfficiency * 4) + (greenAdoption * 0.3)));

      const recentLogs = (recentByUser.get(user.id) || []).map(r => ({
        id: r.id,
        date: r.date,
        carName: r.car.name,
        distance: r.distanceTraveled,
        consumption: r.consumptionRate,
        fuelType: r.fuelType,
        co2: r.carbonEmitted
      }));

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        pulseScore,
        totalCO2: totalCO2 / 1000, // convert to tons
        totalDist,
        logCount,
        greenAdoption: Math.round(greenAdoption),
        recentLogs
      };
    }).sort((a, b) => b.pulseScore - a.pulseScore);

    res.json(leaderboard);
  } catch (error) {
    handleError(res, error);
  }
};
