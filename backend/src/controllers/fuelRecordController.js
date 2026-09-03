import { handleError } from '../utils/errorHandler.js';
import { parseIntParam } from '../utils/validation.js';
import { computeFuelHistory } from '../utils/fuelHistory.js';
import prisma from '../prismaClient.js';
import { z } from 'zod';

const fuelRecordSchema = z.object({
  fuelCost: z.number().nonnegative(),
  pricePerLitre: z.number().nonnegative().optional(),
  pricePerKwh: z.number().nonnegative().optional(),
  odometer: z.number().nonnegative(),
  isFullTank: z.boolean().default(true),
  fuelLevel: z.number().min(0).max(100).optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'E20', 'E85', 'ELECTRICITY']).optional(),
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
    const carId = parseIntParam(req.params.carId);
    if (carId === null) return res.status(400).json({ message: 'Invalid car id' });

    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const { fuelCost, pricePerLitre, pricePerKwh, odometer, isFullTank, fuelLevel, fuelType, date } = fuelRecordSchema.parse(req.body);
    const litresRefueled = (pricePerLitre && pricePerLitre > 0) ? (fuelCost / pricePerLitre) : null;
    const kwhAdded = (pricePerKwh && pricePerKwh > 0) ? (fuelCost / pricePerKwh) : null;

    const record = await prisma.fuelRecord.create({
      data: {
        carId,
        fuelCost,
        pricePerLitre,
        pricePerKwh,
        odometer,
        litresRefueled,
        kwhAdded,
        fuelType: fuelType || (kwhAdded ? 'ELECTRICITY' : 'GASOLINE'),
        distanceTraveled: 0, // Will be recalculated
        consumptionRate: null, // Will be recalculated
        isFullTank,
        fuelLevel: isFullTank ? 100 : fuelLevel,
        submittedById: req.user.id,
        date: date ? new Date(date) : undefined
      }
    });

    // Recalculate everything in correct order
    await recalculateCarHistory(carId);

    // Audit log
    await createAuditLog('CREATE', 'FuelRecord', record.id, req.user.id, req.user.organizationId, {
      carId,
      fuelCost,
      pricePerLitre,
      pricePerKwh,
      odometer,
      litresRefueled,
      kwhAdded,
      fuelType: record.fuelType,
      isFullTank,
      date: date || new Date().toISOString()
    });

    res.status(201).json(record);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    handleError(res, error);
  }
};

export const getFuelRecords = async (req, res) => {
  try {
    const carId = parseIntParam(req.params.carId);
    if (carId === null) return res.status(400).json({ message: 'Invalid car id' });

    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // Not truly paginated: the dashboard's cumulative charts (lifetime CO2,
    // total distance, etc.) need the whole history, so slicing this would
    // silently corrupt those numbers. This is only a safety net against a
    // pathological number of records, not a real pagination limit.
    const records = await prisma.fuelRecord.findMany({
      where: { carId },
      include: {
        submittedBy: { select: { id: true, name: true } }
      },
      orderBy: [
        { odometer: 'asc' },
        { date: 'asc' },
        { id: 'asc' }
      ],
      take: 20000
    });

    res.json(records);
  } catch (error) {
    handleError(res, error);
  }
};

// A record's derived fields depend on the whole history (global average
// consumption is drawn from the first/last full-tank record in the entire
// set), so they can change for records before *and* after an edit — see
// fuelHistory.test.js. We still have to recompute every record in memory,
// but we only need to WRITE the rows whose computed values actually changed,
// which is the common case (e.g. logging a new partial fill-up leaves every
// earlier record untouched).
const FLOAT_EPSILON = 1e-9;
const numbersDiffer = (a, b) => {
  if (a === b) return false;
  if (a == null || b == null) return true;
  return Math.abs(a - b) > FLOAT_EPSILON;
};

const hasChanged = (original, updated) => (
  numbersDiffer(original.distanceTraveled, updated.distanceTraveled) ||
  numbersDiffer(original.consumptionRate, updated.consumptionRate) ||
  numbersDiffer(original.fuelLevel, updated.fuelLevel) ||
  numbersDiffer(original.carbonEmitted, updated.carbonEmitted)
);

export const recalculateCarHistory = async (carId) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  const records = await prisma.fuelRecord.findMany({
    where: { carId },
    orderBy: [
      { odometer: 'asc' },
      { date: 'asc' },
      { id: 'asc' }
    ]
  });

  if (records.length === 0) return;

  const { recordUpdates, newCarbonFactor } = computeFuelHistory(records, car);

  // Only write rows whose computed values actually changed.
  const changedUpdates = recordUpdates.filter((update, i) => hasChanged(records[i], update));

  const transactionOperations = changedUpdates.map(update =>
    prisma.fuelRecord.update({
      where: { id: update.id },
      data: {
        distanceTraveled: update.distanceTraveled,
        consumptionRate: update.consumptionRate,
        fuelLevel: update.fuelLevel,
        carbonEmitted: update.carbonEmitted,
      }
    })
  );

  transactionOperations.push(
    prisma.car.update({
      where: { id: carId },
      data: { currentCarbonFactor: newCarbonFactor }
    })
  );

  await prisma.$transaction(transactionOperations);
};

export const updateFuelRecord = async (req, res) => {
  try {
    const carId = parseIntParam(req.params.carId);
    const recordId = parseIntParam(req.params.recordId);
    if (carId === null || recordId === null) {
      return res.status(400).json({ message: 'Invalid car or record id' });
    }

    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const { fuelCost, pricePerLitre, odometer, isFullTank, fuelLevel, date } = fuelRecordSchema.partial().parse(req.body);

    const existingRecord = await prisma.fuelRecord.findUnique({ where: { id: recordId } });
    if (!existingRecord || existingRecord.carId !== carId) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Org users can only edit records they submitted
    if (req.user.role === 'USER' && existingRecord.submittedById !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit records you submitted' });
    }

    // Save before-state for audit
    const beforeState = {
      carId: existingRecord.carId,
      fuelCost: existingRecord.fuelCost,
      pricePerLitre: existingRecord.pricePerLitre,
      odometer: existingRecord.odometer,
      isFullTank: existingRecord.isFullTank,
      fuelLevel: existingRecord.fuelLevel,
      date: existingRecord.date
    };

    const updateData = {};
    if (fuelCost !== undefined && pricePerLitre !== undefined) {
      updateData.fuelCost = fuelCost;
      updateData.pricePerLitre = pricePerLitre;
      updateData.litresRefueled = pricePerLitre > 0 ? (fuelCost / pricePerLitre) : 0;
    } else if (fuelCost !== undefined) {
      updateData.fuelCost = fuelCost;
      updateData.litresRefueled = existingRecord.pricePerLitre > 0 ? (fuelCost / existingRecord.pricePerLitre) : 0;
    } else if (pricePerLitre !== undefined) {
      updateData.pricePerLitre = pricePerLitre;
      updateData.litresRefueled = pricePerLitre > 0 ? (existingRecord.fuelCost / pricePerLitre) : 0;
    }

    if (odometer !== undefined) updateData.odometer = odometer;
    if (isFullTank !== undefined) {
      updateData.isFullTank = isFullTank;
      if (isFullTank) updateData.fuelLevel = 100;
    }
    if (fuelLevel !== undefined) updateData.fuelLevel = fuelLevel;
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
        carId: beforeState.carId,
        fuelCost: updateData.fuelCost ?? beforeState.fuelCost,
        pricePerLitre: updateData.pricePerLitre ?? beforeState.pricePerLitre,
        odometer: updateData.odometer ?? beforeState.odometer,
        isFullTank: updateData.isFullTank ?? beforeState.isFullTank,
        fuelLevel: updateData.fuelLevel ?? beforeState.fuelLevel,
        date: updateData.date ?? beforeState.date
      }
    });

    res.json({ message: 'Record updated' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    handleError(res, error);
  }
};

export const deleteFuelRecord = async (req, res) => {
  try {
    const carId = parseIntParam(req.params.carId);
    const recordId = parseIntParam(req.params.recordId);
    if (carId === null || recordId === null) {
      return res.status(400).json({ message: 'Invalid car or record id' });
    }

    const car = await findAccessibleCar(carId, req.user);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // Org users (role === 'user') cannot delete records
    if (req.user.role === 'USER') {
      return res.status(403).json({ message: 'You do not have permission to delete records' });
    }

    const record = await prisma.fuelRecord.findUnique({ where: { id: recordId } });
    if (!record || record.carId !== carId) {
      return res.status(404).json({ message: 'Record not found' });
    }

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
    handleError(res, error);
  }
};
