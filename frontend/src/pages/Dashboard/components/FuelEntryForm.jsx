import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCurrencyStore } from '../../../store/useCurrencyStore';

function FuelEntryForm({ selectedCar, onAddFuel, stats, onClose }) {
  const { currency, convert } = useCurrencyStore();
  const [fuelFormData, setFuelFormData] = useState({ 
    fuelCost: '', 
    pricePerLitre: '', 
    odometer: '', 
    isFullTank: true,
    date: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rate = convert(1);
    const toTHB = (val) => rate ? val / rate : val;

    const payload = {
      fuelCost: toTHB(parseFloat(fuelFormData.fuelCost)),
      pricePerLitre: toTHB(parseFloat(fuelFormData.pricePerLitre)),
      odometer: parseFloat(fuelFormData.odometer),
      isFullTank: fuelFormData.isFullTank,
      date: fuelFormData.date
    };
    
    
    await onAddFuel(payload);
    setFuelFormData({ 
      fuelCost: '', 
      pricePerLitre: '', 
      odometer: '', 
      isFullTank: true,
      date: new Date().toISOString().slice(0, 16)
    });
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="card bg-base-100 shadow-2xl max-w-md w-full border border-primary/20 relative"
      >
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4 text-base-content/50 hover:text-base-content"
        >
          ✕
        </button>
        <div className="card-body">
          <h2 className="card-title text-accent border-b border-base-300 pb-2">Add Fuel Record</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-sm opacity-70">Price of Gas ({currency})</label>
            <input required type="number" step="0.01" className="input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none input-sm input-bordered" value={fuelFormData.fuelCost} onChange={e => setFuelFormData({ ...fuelFormData, fuelCost: e.target.value })} />

            <label className="text-sm opacity-70 mt-2">Gas Price per Litre ({currency})</label>
            <input required type="number" step="0.01" className="input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none input-sm input-bordered" value={fuelFormData.pricePerLitre} onChange={e => setFuelFormData({ ...fuelFormData, pricePerLitre: e.target.value })} />

            <label className="text-sm opacity-70 mt-2">Current Mileage (km)</label>
            <input required type="number" step="0.1" className="input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none input-sm input-bordered" value={fuelFormData.odometer} onChange={e => setFuelFormData({ ...fuelFormData, odometer: e.target.value })} />

            <label className="text-sm opacity-70 mt-2">Date & Time</label>
            <input required type="datetime-local" className="input input-sm input-bordered" value={fuelFormData.date} onChange={e => setFuelFormData({ ...fuelFormData, date: e.target.value })} />

            <label className="label cursor-pointer mt-2 justify-start gap-4">
              <span className="label-text opacity-80 font-medium">Full tank</span>
              <input type="checkbox" className="toggle toggle-accent" checked={fuelFormData.isFullTank} onChange={e => setFuelFormData({ ...fuelFormData, isFullTank: e.target.checked })} />
            </label>

            <button className="btn btn-accent btn-sm mt-4">Refuel</button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}

export default FuelEntryForm;
