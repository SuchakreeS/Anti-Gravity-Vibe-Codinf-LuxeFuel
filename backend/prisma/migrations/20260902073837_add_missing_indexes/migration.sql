-- CreateIndex
CREATE INDEX `AuditLog_organizationId_createdAt_idx` ON `AuditLog`(`organizationId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Car_organizationId_isPersonal_idx` ON `Car`(`organizationId`, `isPersonal`);

-- CreateIndex
CREATE INDEX `Car_userId_isPersonal_idx` ON `Car`(`userId`, `isPersonal`);

-- CreateIndex
CREATE INDEX `FuelRecord_carId_odometer_date_idx` ON `FuelRecord`(`carId`, `odometer`, `date`);
