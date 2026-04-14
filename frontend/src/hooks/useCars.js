import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';

export function useCars(user) {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const fetchCars = useCallback(async () => {
    try {
      const res = await api.get('/cars');
      setCars(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch cars', err);
      return [];
    }
  }, []);

  const fetchMakes = useCallback(async () => {
    setLoadingMakes(true);
    try {
      const res = await api.get('/cars/makes');
      setMakes(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch makes', err);
    } finally {
      setLoadingMakes(false);
    }
  }, []);

  const fetchModels = useCallback(async (makeName) => {
    if (!makeName) return;
    setLoadingModels(true);
    try {
      const make = makes.find(m => m.name === makeName);
      if (make) {
        const res = await api.get(`/cars/models?make_id=${make.id}`);
        setModels(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch models', err);
    } finally {
      setLoadingModels(false);
    }
  }, [makes]);

  const addCar = useCallback(async (carData) => {
    try {
      const res = await api.post('/cars', carData);
      setCars(prev => [res.data, ...prev]);
      setSelectedCar(res.data);
      Swal.fire('Success', 'Car added!', 'success');
      return res.data;
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to add car', 'error');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCars();
    }
  }, [user, fetchCars]);

  // Separate org cars from personal cars
  const orgCars = cars.filter(c => !c.isPersonal);
  const personalCars = cars.filter(c => c.isPersonal);

  return {
    cars,
    orgCars,
    personalCars,
    setCars,
    selectedCar,
    setSelectedCar,
    makes,
    models,
    loadingMakes,
    loadingModels,
    fetchCars,
    fetchMakes,
    fetchModels,
    addCar
  };
}
