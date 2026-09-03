import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFuelHistory } from './fuelHistory.js';

const iceCar = { engineType: 'ICE', tankSize: 50, currentCarbonFactor: 2.31 };
const evCar = { engineType: 'EV', tankSize: 0, currentCarbonFactor: 0.40 };

// Minimal fuel record fixture builder.
const rec = (id, overrides = {}) => ({
  id,
  carId: 1,
  odometer: 0,
  fuelType: 'GASOLINE',
  isFullTank: true,
  litresRefueled: null,
  kwhAdded: null,
  fuelLevel: null,
  consumptionRate: null,
  carbonEmitted: null,
  distanceTraveled: 0,
  ...overrides,
});

test('empty history returns no updates and preserves current carbon factor', () => {
  const { recordUpdates, newCarbonFactor } = computeFuelHistory([], iceCar);
  assert.deepEqual(recordUpdates, []);
  assert.equal(newCarbonFactor, iceCar.currentCarbonFactor);
});

test('a single full-tank record has zero distance/carbon and full fuel level', () => {
  const records = [rec(1, { odometer: 1000, isFullTank: true, litresRefueled: 40 })];
  const { recordUpdates } = computeFuelHistory(records, iceCar);

  assert.equal(recordUpdates.length, 1);
  assert.equal(recordUpdates[0].distanceTraveled, 0);
  assert.equal(recordUpdates[0].carbonEmitted, 0);
  assert.equal(recordUpdates[0].fuelLevel, 100);
  // No prior full-tank to close a segment against, so consumptionRate is untouched.
  assert.equal(recordUpdates[0].consumptionRate, null);
});

test('two full-tank fill-ups compute a segment average and matching consumption rate', () => {
  // 500 distance covered on 25L between the two full tanks -> 20 km/L.
  const records = [
    rec(1, { odometer: 1000, isFullTank: true, litresRefueled: 40 }),
    rec(2, { odometer: 1500, isFullTank: true, litresRefueled: 25 }),
  ];
  const { recordUpdates } = computeFuelHistory(records, iceCar);

  assert.equal(recordUpdates[1].distanceTraveled, 500);
  assert.equal(recordUpdates[1].consumptionRate, 20); // 500 / 25
  assert.ok(recordUpdates[1].carbonEmitted > 0);
});

test('a partial (non-full-tank) fill between two full tanks uses the global average consumption', () => {
  const records = [
    rec(1, { odometer: 1000, isFullTank: true, litresRefueled: 40 }),
    rec(2, { odometer: 1200, isFullTank: false, litresRefueled: 10 }),
    rec(3, { odometer: 1500, isFullTank: true, litresRefueled: 25 }),
  ];
  const { recordUpdates } = computeFuelHistory(records, iceCar);

  // Global avg consumption = totalDist(500) / totalEnergy(10 + 25 = 35) = 500/35
  const expectedGlobalAvg = 500 / 35;
  assert.ok(Math.abs(recordUpdates[1].consumptionRate - expectedGlobalAvg) < 1e-9);
  // Full-tank segment average overwrites both records 2 and 3 in the closed segment.
  assert.ok(Math.abs(recordUpdates[2].consumptionRate - expectedGlobalAvg) < 1e-9);
});

test('EV records use kWh instead of litres and the EV emission factor', () => {
  const records = [
    rec(1, { odometer: 0, isFullTank: true, kwhAdded: 20, fuelType: 'ELECTRICITY' }),
    rec(2, { odometer: 100, isFullTank: true, kwhAdded: 15, fuelType: 'ELECTRICITY' }),
  ];
  const { recordUpdates } = computeFuelHistory(records, evCar);

  assert.equal(recordUpdates[1].consumptionRate, 100 / 15);
  assert.ok(recordUpdates[1].carbonEmitted >= 0);
});

test('appending a new partial fill-up after the last full tank does not change any prior record', () => {
  const before = [
    rec(1, { odometer: 1000, isFullTank: true, litresRefueled: 40 }),
    rec(2, { odometer: 1500, isFullTank: true, litresRefueled: 25 }),
  ];
  const { recordUpdates: baseline } = computeFuelHistory(before, iceCar);

  const after = [
    ...before,
    rec(3, { odometer: 1600, isFullTank: false, litresRefueled: 5 }),
  ];
  const { recordUpdates: withAppend } = computeFuelHistory(after, iceCar);

  // Records 1 and 2 must be byte-identical whether or not the trailing
  // partial fill-up exists — this is the invariant the write-skip
  // optimization in recalculateCarHistory relies on.
  assert.deepEqual(withAppend[0], baseline[0]);
  assert.deepEqual(withAppend[1], baseline[1]);
});
