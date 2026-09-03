/**
 * Pure fuel-history recalculation logic, extracted from
 * fuelRecordController.recalculateCarHistory so it can be unit-tested
 * without a database. Behavior is unchanged from the original inline
 * implementation — see fuelRecordController.test.js for characterization
 * tests that pin down current outputs before any future optimization.
 */

export const EMISSION_FACTORS = {
  GASOLINE: 2.31,
  DIESEL: 2.68,
  E20: 1.85,
  E85: 1.51,
  ELECTRICITY: 0.40,
};

export const calculateGlobalAvgConsumption = (records, engineType) => {
  const fullTankRecords = records.filter(r => r.isFullTank);
  if (fullTankRecords.length < 2) return null;

  const firstFT = fullTankRecords[0];
  const lastFT = fullTankRecords[fullTankRecords.length - 1];
  const totalDist = lastFT.odometer - firstFT.odometer;

  const midRecords = records.slice(records.indexOf(firstFT) + 1, records.indexOf(lastFT) + 1);
  const totalEnergy = midRecords.reduce((sum, r) => {
    const litres = r.litresRefueled || 0;
    const kwh = r.kwhAdded || 0;
    if (engineType === 'EV') return sum + kwh;
    if (engineType === 'ICE' || engineType === 'HEV') return sum + litres;
    return sum + litres + (kwh / 8.9);
  }, 0);

  return totalEnergy > 0 ? totalDist / totalEnergy : null;
};

export const calculateNewBlendFactor = (carTankSize, runningFuelLevel, fuelUsed, addedLitres, addedFactor, currentBlendFactor) => {
  if (carTankSize <= 0) return currentBlendFactor;

  const remainingLitres = Math.max(0, ((runningFuelLevel / 100) * carTankSize) - fuelUsed);
  const newTotalLitres = remainingLitres + addedLitres;

  if (newTotalLitres > 0) {
    return ((remainingLitres * currentBlendFactor) + (addedLitres * addedFactor)) / newTotalLitres;
  }
  return currentBlendFactor;
};

/**
 * Given a car's ordered fuel records (sorted by odometer, date, id — same
 * order the caller queries with), recompute distanceTraveled, carbonEmitted,
 * consumptionRate and fuelLevel for every record, plus the car's updated
 * currentCarbonFactor.
 *
 * Pure function: no DB access, no mutation of the input records.
 *
 * @param {Array} records - fuel records for one car, already sorted
 * @param {{ engineType: string, tankSize: number|null, currentCarbonFactor: number|null }} car
 * @returns {{ recordUpdates: Array, newCarbonFactor: number }}
 */
export const computeFuelHistory = (records, car) => {
  if (records.length === 0) {
    return { recordUpdates: [], newCarbonFactor: car?.currentCarbonFactor ?? 2.31 };
  }

  const globalAvgConsumption = calculateGlobalAvgConsumption(records, car.engineType);

  let lastFullTankIdx = -1;
  let runningFuelLevel = 100; // Starting assumption
  let currentBlendFactor = car.currentCarbonFactor || 2.31;

  const recordUpdates = records.map(r => ({ ...r }));

  for (let i = 0; i < recordUpdates.length; i++) {
    const current = recordUpdates[i];
    const previous = i > 0 ? recordUpdates[i - 1] : null;

    current.distanceTraveled = previous ? current.odometer - previous.odometer : 0;

    const segmentConsumption = globalAvgConsumption || 10;
    const fuelUsed = current.distanceTraveled / segmentConsumption;
    current.carbonEmitted = fuelUsed * currentBlendFactor;

    const addedFactor = EMISSION_FACTORS[current.fuelType] || (car.engineType === 'EV' ? 0.40 : 2.31);
    const addedLitres = current.litresRefueled || 0; // For PHEV/ICE tank mixing

    currentBlendFactor = calculateNewBlendFactor(
      car.tankSize,
      runningFuelLevel,
      fuelUsed,
      addedLitres,
      addedFactor,
      currentBlendFactor
    );

    if (current.isFullTank) {
      current.fuelLevel = 100;
      if (lastFullTankIdx !== -1) {
        const segmentRecords = recordUpdates.slice(lastFullTankIdx + 1, i + 1);
        const segmentEnergy = segmentRecords.reduce((sum, r) => {
          const litres = r.litresRefueled || 0;
          const kwh = r.kwhAdded || 0;
          if (car.engineType === 'EV') return sum + kwh;
          if (car.engineType === 'ICE' || car.engineType === 'HEV') return sum + litres;
          return sum + litres + (kwh / 8.9);
        }, 0);
        const segmentDist = current.odometer - recordUpdates[lastFullTankIdx].odometer;

        if (segmentEnergy > 0) {
          const segmentAvg = segmentDist / segmentEnergy;
          for (let j = lastFullTankIdx + 1; j <= i; j++) {
            recordUpdates[j].consumptionRate = segmentAvg;
          }
        }
      }
      lastFullTankIdx = i;
      runningFuelLevel = 100;
    } else {
      current.consumptionRate = globalAvgConsumption;
      if (car.tankSize > 0 && car.engineType !== 'EV') {
        const remainingAfterUsage = ((runningFuelLevel / 100) * car.tankSize) - fuelUsed;
        const totalAfterRefill = remainingAfterUsage + addedLitres;
        current.fuelLevel = Math.min(100, Math.max(0, (totalAfterRefill / car.tankSize) * 100));
        runningFuelLevel = current.fuelLevel;
      } else {
        current.fuelLevel = null;
      }
    }
  }

  return { recordUpdates, newCarbonFactor: currentBlendFactor };
};
