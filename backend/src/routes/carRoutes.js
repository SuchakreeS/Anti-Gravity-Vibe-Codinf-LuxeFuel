import express from 'express';
import * as carController from '../controllers/carController.js';
import * as fuelRecordController from '../controllers/fuelRecordController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/makes', carController.getProxyMakes);
router.get('/models', carController.getProxyModels);

router.post('/', carController.createCar);
router.get('/', carController.getCars);
router.get('/:id', carController.getCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

router.post('/:carId/records', fuelRecordController.addFuelRecord);
router.get('/:carId/records', fuelRecordController.getFuelRecords);
router.put('/:carId/records/:recordId', fuelRecordController.updateFuelRecord);
router.delete('/:carId/records/:recordId', fuelRecordController.deleteFuelRecord);

export default router;
