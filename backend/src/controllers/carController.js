import { handleError } from '../utils/errorHandler.js';
import { parseIntParam } from '../utils/validation.js';
import prisma from '../prismaClient.js';
import { z } from 'zod';
import axios from 'axios';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, or WebP images are allowed'));
    }
    cb(null, true);
  },
});

export const uploadCarPhotoHandler = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: error.message });
    }
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  });
};

export const uploadCarPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = await uploadToCloudinary(req.file.buffer);
    res.json({ url });
  } catch (error) {
    handleError(res, error);
  }
};

const carSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  licensePlate: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  tankSize: z.number().nonnegative().nullable().optional(),
  batteryCapacity: z.number().nonnegative().nullable().optional(),
  engineType: z.enum(['ICE', 'EV', 'PHEV', 'HEV']).optional().default('ICE'),
  otherSpecs: z.string().nullable().optional(),
  maintenanceData: z.string().nullable().optional(),
  isPersonal: z.boolean().optional().default(false),
});

const getAccessibleCarWhereClause = (id, user, action) => {
  const { id: userId, role, organizationId: orgId } = user;
  
  if (action === 'read') {
    if (orgId) {
      return { id, OR: [{ organizationId: orgId, isPersonal: false }, { userId, isPersonal: true }] };
    }
    return { id, userId };
  }
  
  if (action === 'update') {
    if (role === 'ADMIN' && orgId) {
      return { id, OR: [{ organizationId: orgId, isPersonal: false }, { userId, isPersonal: true }] };
    }
    return { id, userId };
  }

  if (action === 'delete') {
    if (role === 'ADMIN' && orgId) {
      return { id, OR: [{ organizationId: orgId, isPersonal: false }, { userId, isPersonal: true }] };
    }
    if (role === 'USER') {
      return { id, userId, isPersonal: true };
    }
    return { id, userId };
  }
};

export const createCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = carSchema.parse(req.body);
    const role = req.user.role;
    const orgId = req.user.organizationId;

    let carData = {
      name: data.name,
      brand: data.brand,
      model: data.model,
      licensePlate: data.licensePlate || null,
      photoUrl: data.photoUrl || null,
      tankSize: data.tankSize,
      batteryCapacity: data.batteryCapacity,
      engineType: data.engineType,
      otherSpecs: data.otherSpecs || null,
      maintenanceData: data.maintenanceData || null,
    };

    if (role === 'ADMIN') {
      if (data.isPersonal) {
        // Admin adding their own personal car
        carData.isPersonal = true;
        carData.userId = userId;
      } else {
        // Admin adding an org car
        carData.isPersonal = false;
        carData.organizationId = orgId;
        if (!data.licensePlate) {
          return res.status(400).json({ message: 'License plate is required for organization cars' });
        }
      }
    } else if (role === 'USER') {
      // Org user can only create personal cars
      carData.isPersonal = true;
      carData.userId = userId;
      if (!data.licensePlate) {
        return res.status(400).json({ message: 'License plate is required' });
      }
    } else {
      // individual user — current behavior
      carData.isPersonal = true;
      carData.userId = userId;
    }

    const car = await prisma.car.create({ data: carData });
    res.status(201).json(car);
  } catch (error) {
     if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
     handleError(res, error);
  }
};

export const getCars = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const orgId = req.user.organizationId;

    // Defensive cap: no UI lists more than this many cars at once today, so this
    // just bounds worst-case query/payload size without changing normal behavior.
    const CARS_HARD_CAP = 1000;

    let cars;
    if (orgId && (role === 'ADMIN' || role === 'USER')) {
      // Return org cars + user's personal cars
      cars = await prisma.car.findMany({
        where: {
          OR: [
            { organizationId: orgId, isPersonal: false },
            { userId: userId, isPersonal: true }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: CARS_HARD_CAP
      });
    } else {
      // Individual user — their own cars
      cars = await prisma.car.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: CARS_HARD_CAP
      });
    }

    res.json(cars);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCar = async (req, res) => {
  try {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ message: 'Invalid car id' });
    const whereClause = getAccessibleCarWhereClause(id, req.user, 'read');

    const car = await prisma.car.findFirst({
      where: whereClause,
      include: { fuelRecords: { orderBy: { date: 'desc' } } }
    });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateCar = async (req, res) => {
  try {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ message: 'Invalid car id' });
    const whereClause = getAccessibleCarWhereClause(id, req.user, 'update');

    const existing = await prisma.car.findFirst({ where: whereClause });

    if (!existing) return res.status(404).json({ message: 'Car not found' });

    const data = carSchema.parse(req.body);
    const car = await prisma.car.update({
      where: { id },
      data: {
        name: data.name,
        brand: data.brand,
        model: data.model,
        licensePlate: data.licensePlate || existing.licensePlate,
        photoUrl: data.photoUrl || existing.photoUrl,
        tankSize: data.tankSize ?? existing.tankSize,
        batteryCapacity: data.batteryCapacity ?? existing.batteryCapacity,
        engineType: data.engineType ?? existing.engineType,
        otherSpecs: data.otherSpecs || null,
        maintenanceData: data.maintenanceData || existing.maintenanceData,
      }
    });
    res.json(car);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    handleError(res, error);
  }
};

export const deleteCar = async (req, res) => {
  try {
    const id = parseIntParam(req.params.id);
    if (id === null) return res.status(400).json({ message: 'Invalid car id' });
    const whereClause = getAccessibleCarWhereClause(id, req.user, 'delete');

    const existing = await prisma.car.findFirst({ where: whereClause });

    if (!existing) return res.status(404).json({ message: 'Car not found' });

    await prisma.$transaction([
      prisma.fuelRecord.deleteMany({ where: { carId: id } }),
      prisma.car.delete({ where: { id } })
    ]);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

// Simple in-memory TTL cache for the (near-static) carapi.app make/model lookups.
// Avoids round-tripping to a third-party API on every "add car" form load.
const CARAPI_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const carapiCache = new Map(); // key -> { data, expiresAt }

const getCached = (key) => {
  const entry = carapiCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  carapiCache.delete(key);
  return null;
};

const setCached = (key, data) => {
  carapiCache.set(key, { data, expiresAt: Date.now() + CARAPI_CACHE_TTL_MS });
};

export const getProxyMakes = async (req, res) => {
  try {
    const cacheKey = 'makes';
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get('https://carapi.app/api/makes');
    setCached(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('CarAPI Makes Proxy Error:', error.message);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
};

export const getProxyModels = async (req, res) => {
  try {
    const { make_id } = req.query;
    if (!make_id) return res.status(400).json({ message: 'make_id is required' });

    const cacheKey = `models:${make_id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`https://carapi.app/api/models/v2?make_id=${make_id}`);
    setCached(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('CarAPI Models Proxy Error:', error.message);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
};
