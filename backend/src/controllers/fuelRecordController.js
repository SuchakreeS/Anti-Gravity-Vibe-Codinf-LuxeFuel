import prisma from '../prismaClient.js';
import { z } from 'zod';

const fuelRecordSchema = z.object({
  fuelCost: z.number().positive(),
  pricePerLitre: z.number().positive(),
  odometer: z.number().positive(),
  isFullTank: z.boolean().default(true),
  date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

/**
 * Helper: create an audit log entry (only for org users)
 */
const createAuditLog = async (action, entityType, entityId, userId, organizationId, details) => {
  if (!organizationId) return; // no audit for individual users
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      userId,
      organizationId,
      details: details ? JSON.stringify(details) : null
    }
  });
};

/**
 * Check if user has access to a car (org car or personal car)
 */
const findAccessibleCar = async (carId, user) => {
  const orgId = user.organizationId;
  if (orgId) {
    return prisma.car.findFirst({
      where: {
        id: carId,
        OR: [
          { organizationId: orgId, isPersonal: false },
          { userId: user.id, isPersonal: true }
        ]
      }
    });
  }
  return prisma.car.findFirst({ where: { id: carId, userId: user.id } });
};

export const addFuelRecord = async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    
    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const { fuelCost, pricePerLitre, odometer, isFullTank, date } = fuelRecordSchema.parse(req.body);

    const litresRefueled = fuelCost / pricePerLitre;

    const previousRecord = await prisma.fuelRecord.findFirst({
      where: { carId },
      orderBy: { odometer: 'desc' },
    });

    let distanceTraveled = 0;
    if (previousRecord) {
      if (odometer <= previousRecord.odometer) {
        return res.status(400).json({ message: 'Odometer must be greater than previous reading (' + previousRecord.odometer + ')' });
      }
      distanceTraveled = odometer - previousRecord.odometer;
    }

    let consumptionRate = null;

    if (isFullTank && previousRecord) {
      const lastFullTank = await prisma.fuelRecord.findFirst({
        where: { carId, isFullTank: true, odometer: { lt: odometer } },
        orderBy: { odometer: 'desc' }
      });

      if (lastFullTank) {
        const partialFills = await prisma.fuelRecord.findMany({
          where: { 
             carId, 
             odometer: { gt: lastFullTank.odometer, lt: odometer }
          }
        });

        const totalPartialLitres = partialFills.reduce((sum, f) => sum + f.litresRefueled, 0);
        const totalLitresConsumed = totalPartialLitres + litresRefueled;
        const totalDistance = odometer - lastFullTank.odometer;

        consumptionRate = totalDistance / totalLitresConsumed;
      }
    }

    const record = await prisma.fuelRecord.create({
      data: {
        carId,
        fuelCost,
        pricePerLitre,
        odometer,
        litresRefueled,
        distanceTraveled,
        consumptionRate,
        isFullTank,
        submittedById: req.user.id,
        date: date ? new Date(date) : undefined
      }
    });

    // Audit log
    await createAuditLog('CREATE', 'FuelRecord', record.id, req.user.id, req.user.organizationId, {
      carId,
      fuelCost,
      pricePerLitre,
      odometer,
      litresRefueled,
      isFullTank,
      date: date || new Date().toISOString()
    });

    res.status(201).json(record);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: error.message });
  }
};

export const getFuelRecords = async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    
    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const records = await prisma.fuelRecord.findMany({
      where: { carId },
      include: {
        submittedBy: { select: { id: true, name: true } }
      },
      orderBy: { date: 'asc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recalculateCarHistory = async (carId) => {
  const records = await prisma.fuelRecord.findMany({
    where: { carId },
    orderBy: { odometer: 'asc' }
  });

  if (records.length === 0) return;

  for (let i = 0; i < records.length; i++) {
    const current = records[i];
    const previous = i > 0 ? records[i - 1] : null;

    let distanceTraveled = 0;
    let consumptionRate = null;

    if (previous) {
      distanceTraveled = current.odometer - previous.odometer;
    }

    if (current.isFullTank && previous) {
      const lastFullTankIndex = records.slice(0, i).findLastIndex(r => r.isFullTank);
      const lastFullTank = lastFullTankIndex !== -1 ? records[lastFullTankIndex] : null;

      if (lastFullTank) {
        const partialFills = records.slice(lastFullTankIndex + 1, i);
        const totalPartialLitres = partialFills.reduce((sum, f) => sum + f.litresRefueled, 0);
        const totalLitresConsumed = totalPartialLitres + current.litresRefueled;
        const totalDistance = current.odometer - lastFullTank.odometer;

        consumptionRate = totalDistance / totalLitresConsumed;
      }
    }

    await prisma.fuelRecord.update({
      where: { id: current.id },
      data: { distanceTraveled, consumptionRate }
    });
  }
};

export const updateFuelRecord = async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    const recordId = parseInt(req.params.recordId);

    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const { fuelCost, pricePerLitre, odometer, isFullTank, date } = fuelRecordSchema.partial().parse(req.body);

    const existingRecord = await prisma.fuelRecord.findUnique({ where: { id: recordId } });
    if (!existingRecord) return res.status(404).json({ message: 'Record not found' });

    // Org users can only edit records they submitted
    if (req.user.role === 'user' && existingRecord.submittedById !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit records you submitted' });
    }

    // Save before-state for audit
    const beforeState = {
      fuelCost: existingRecord.fuelCost,
      pricePerLitre: existingRecord.pricePerLitre,
      odometer: existingRecord.odometer,
      isFullTank: existingRecord.isFullTank,
      date: existingRecord.date
    };

    const updateData = {};
    if (fuelCost !== undefined && pricePerLitre !== undefined) {
       updateData.fuelCost = fuelCost;
       updateData.pricePerLitre = pricePerLitre;
       updateData.litresRefueled = fuelCost / pricePerLitre;
    } else if (fuelCost !== undefined) {
       updateData.fuelCost = fuelCost;
       updateData.litresRefueled = fuelCost / existingRecord.pricePerLitre;
    } else if (pricePerLitre !== undefined) {
       updateData.pricePerLitre = pricePerLitre;
       updateData.litresRefueled = existingRecord.fuelCost / pricePerLitre;
    }

    if (odometer !== undefined) updateData.odometer = odometer;
    if (isFullTank !== undefined) updateData.isFullTank = isFullTank;
    if (date !== undefined) updateData.date = new Date(date);

    await prisma.fuelRecord.update({
      where: { id: recordId },
      data: updateData
    });

    await recalculateCarHistory(carId);

    // Audit log with before/after
    await createAuditLog('UPDATE', 'FuelRecord', recordId, req.user.id, req.user.organizationId, {
      before: beforeState,
      after: {
        fuelCost: updateData.fuelCost ?? beforeState.fuelCost,
        pricePerLitre: updateData.pricePerLitre ?? beforeState.pricePerLitre,
        odometer: updateData.odometer ?? beforeState.odometer,
        isFullTank: updateData.isFullTank ?? beforeState.isFullTank,
        date: updateData.date ?? beforeState.date
      }
    });

    res.json({ message: 'Record updated' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: error.message });
  }
};

export const deleteFuelRecord = async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    const recordId = parseInt(req.params.recordId);

    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // Org users (role === 'user') cannot delete records
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'You do not have permission to delete records' });
    }

    const record = await prisma.fuelRecord.findUnique({ where: { id: recordId } });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Audit log before deletion
    await createAuditLog('DELETE', 'FuelRecord', recordId, req.user.id, req.user.organizationId, {
      carId: record.carId,
      fuelCost: record.fuelCost,
      pricePerLitre: record.pricePerLitre,
      odometer: record.odometer,
      isFullTank: record.isFullTank,
      date: record.date
    });

    await prisma.fuelRecord.delete({ where: { id: recordId } });
    await recalculateCarHistory(carId);

    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
