import { useState, useCallback, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { useCurrencyStore } from '../store/useCurrencyStore';

export function useFuelRecords(selectedCarId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const convert = useCurrencyStore((state) => state.convert);

  const fetchRecords = useCallback(async (carId) => {
    if (!carId) return;
    setLoading(true);
    try {
      const res = await api.get(`/cars/${carId}/records`);
      const formatted = res.data.map(r => ({
        ...r,
        displayDate: format(new Date(r.date), "dd MMM ''yy"),
        displayTime: format(new Date(r.date), 'HH:mm'),
        xAxisLabel: format(new Date(r.date), 'MMM dd'),
      }));
      setRecords(formatted);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecord = useCallback(async (carId, payload) => {
    try {
      await api.post(`/cars/${carId}/records`, payload);
      Swal.fire('Success', 'Fuel record added!', 'success');
      fetchRecords(carId);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to add record', 'error');
      throw err;
    }
  }, [fetchRecords]);

  const updateRecord = useCallback(async (carId, recordId, payload) => {
    try {
      await api.put(`/cars/${carId}/records/${recordId}`, payload);
      Swal.fire('Success', 'Record updated!', 'success');
      fetchRecords(carId);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
      throw err;
    }
  }, [fetchRecords]);

  const deleteRecord = useCallback(async (carId, recordId) => {
    try {
      await api.delete(`/cars/${carId}/records/${recordId}`);
      Swal.fire('Deleted!', 'Record removed successfully.', 'success');
      fetchRecords(carId);
    } catch (err) {
      Swal.fire('Error', 'Deletion failed', 'error');
      throw err;
    }
  }, [fetchRecords]);

  useEffect(() => {
    if (selectedCarId) {
      fetchRecords(selectedCarId);
    } else {
      setRecords([]);
    }
  }, [selectedCarId, fetchRecords]);

  const convertedRecords = useMemo(() => {
    return records.map(r => ({
      ...r,
      convertedFuelCost: convert(r.fuelCost),
      convertedPricePerLitre: convert(r.pricePerLitre),
    }));
  }, [records, convert]);

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    
    const latest = records[records.length - 1];
    const fullTankRecords = records.filter(r => r.isFullTank && r.consumptionRate !== null);
    const avgConsumption = fullTankRecords.length > 0
      ? fullTankRecords.reduce((sum, r) => sum + r.consumptionRate, 0) / fullTankRecords.length
      : null;

    let comparison = null;
    if (latest.isFullTank && latest.consumptionRate !== null) {
      const previousFullFills = records.filter(r => r.isFullTank && r.consumptionRate !== null && r.id !== latest.id);
      const previous = previousFullFills.length > 0 ? previousFullFills[previousFullFills.length - 1] : null;
      
      if (previous) {
        comparison = {
          latest: latest.consumptionRate,
          previous: previous.consumptionRate,
          diff: latest.consumptionRate - previous.consumptionRate,
          isEfficiencyImproved: (latest.consumptionRate - previous.consumptionRate) > 0
        };
      }
    }

    return {
      latest,
      avgConsumption,
      fullTankCount: fullTankRecords.length,
      comparison
    };
  }, [records]);

  return {
    records,
    convertedRecords,
    loading,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    stats
  };
}
