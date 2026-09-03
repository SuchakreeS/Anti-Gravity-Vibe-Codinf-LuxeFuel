import { handleError } from '../utils/errorHandler.js';
import prisma from '../prismaClient.js';

export const getAuditLogs = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const { userId, entityType, from, to, page = 1, limit = 50 } = req.query;

    const where = { organizationId: orgId };

    if (userId) where.userId = parseInt(userId);
    if (entityType) where.entityType = entityType;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rawLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    // Extract all referenced car Ids
    const carIds = new Set();
    rawLogs.forEach(log => {
      if (log.entityType === 'Car') carIds.add(log.entityId);
      if (log.details) {
        try {
          const details = JSON.parse(log.details);
          if (details.carId) carIds.add(details.carId);
          if (details.before?.carId) carIds.add(details.before.carId);
          if (details.after?.carId) carIds.add(details.after.carId);
        } catch(e) {}
      }
    });

    // Fetch car display info
    const cars = await prisma.car.findMany({
      where: { id: { in: Array.from(carIds) } },
      select: { id: true, name: true, licensePlate: true }
    });
    const carMap = {};
    cars.forEach(c => carMap[c.id] = c);

    // Patch the logs before returning
    const logs = rawLogs.map(log => {
      const logCopy = { ...log };
      if (log.details) {
        try {
          const details = JSON.parse(log.details);
          if (details.carId && carMap[details.carId]) {
            details.carLicensePlate = carMap[details.carId].licensePlate || carMap[details.carId].name;
          }
          if (details.before?.carId && carMap[details.before.carId]) {
            details.before.carLicensePlate = carMap[details.before.carId].licensePlate || carMap[details.before.carId].name;
          }
          if (details.after?.carId && carMap[details.after.carId]) {
            details.after.carLicensePlate = carMap[details.after.carId].licensePlate || carMap[details.after.carId].name;
          }
          
          // Add resolved car name for root entity display
          if (log.entityType === 'Car' && carMap[log.entityId]) {
             details._resolvedEntityName = carMap[log.entityId].licensePlate || carMap[log.entityId].name;
          } else if (log.entityType === 'FuelRecord' && details.carLicensePlate) {
             details._resolvedEntityName = details.carLicensePlate;
          }
          
          logCopy.details = JSON.stringify(details);
        } catch(e) {}
      } else {
        // Create an empty details object just to hold _resolvedEntityName
        if (log.entityType === 'Car' && carMap[log.entityId]) {
           logCopy.details = JSON.stringify({ _resolvedEntityName: carMap[log.entityId].licensePlate || carMap[log.entityId].name });
        }
      }
      return logCopy;
    });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};
