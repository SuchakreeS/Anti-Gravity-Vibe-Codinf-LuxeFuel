import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCurrencyStore } from '../../../store/useCurrencyStore';

function FuelEntryForm({ selectedCar, onAddFuel, stats, onClose }) {
  const { currency, convert } = useCurrencyStore();
  const [fuelFormData, setFuelFormData] = useState({ 
    fuelCost: '', 
    pricePerUnit: '', 
    odometer: '', 
    isFullTank: true,
    fuelLevel: 100,
    fuelType: selectedCar?.engineType === 'EV' ? 'ELECTRICITY' : 'GASOLINE',
    date: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rate = convert(1);
    const toTHB = (val) => rate ? val / rate : val;

    const isElec = fuelFormData.fuelType === 'ELECTRICITY';

    const payload = {
      fuelCost: toTHB(parseFloat(fuelFormData.fuelCost)),
      pricePerLitre: isElec ? undefined : toTHB(parseFloat(fuelFormData.pricePerUnit)),
      pricePerKwh: isElec ? toTHB(parseFloat(fuelFormData.pricePerUnit)) : undefined,
      odometer: parseFloat(fuelFormData.odometer),
      isFullTank: fuelFormData.isFullTank,
      fuelLevel: fuelFormData.isFullTank ? 100 : fuelFormData.fuelLevel,
      fuelType: fuelFormData.fuelType,
      date: fuelFormData.date
    };
    
    
    await onAddFuel(payload);
    setFuelFormData({ 
      fuelCost: '', 
      pricePerUnit: '', 
      odometer: '', 
      isFullTank: true,
      fuelLevel: 100,
      fuelType: selectedCar?.engineType === 'EV' ? 'ELECTRICITY' : 'GASOLINE',
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
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
        <div className="card-body">
          <h2 className="card-title text-accent border-b border-base-300 pb-2 font-['Rajdhani'] font-black italic uppercase tracking-tighter">
            {selectedCar?.engineType === 'EV' ? 'Log Charging Session' : 'Add Fuel Record'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 ml-1">Fuel Type</label>
                <select 
                  className="select select-bordered select-sm w-full font-bold"
                  value={fuelFormData.fuelType}
                  onChange={e => setFuelFormData({ ...fuelFormData, fuelType: e.target.value })}
                >
                  {selectedCar?.engineType !== 'EV' && (
                    <>
                      <option value="GASOLINE">GASOLINE</option>
                      <option value="DIESEL">DIESEL</option>
                      <option value="E20">E20</option>
                      <option value="E85">E85</option>
                    </>
                  )}
                  {(selectedCar?.engineType === 'EV' || selectedCar?.engineType === 'PHEV') && (
                    <option value="ELECTRICITY">ELECTRICITY</option>
                  )}
                </select>
              </div>
              <div className="form-control">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 ml-1">Total Cost ({currency})</label>
                <input required type="number" step="0.01" className="input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none input-sm input-bordered font-bold" value={fuelFormData.fuelCost} onChange={e => setFuelFormData({ ...fuelFormData, fuelCost: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="form-control">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 ml-1">Price per {fuelFormData.fuelType === 'ELECTRICITY' ? 'kWh' : 'Litre'} ({currency})</label>
                <input required type="number" step="0.01" className="input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none input-sm input-bordered font-bold" value={fuelFormData.pricePerUnit} onChange={e => setFuelFormData({ ...fuelFormData, pricePerUnit: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 ml-1">Current Mileage (km)</label>
                <input required type="number" step="0.1" className="input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none input-sm input-bordered font-bold" value={fuelFormData.odometer} onChange={e => setFuelFormData({ ...fuelFormData, odometer: e.target.value })} />
              </div>
            </div>

            {stats?.latest && (
              <span className="text-[10px] opacity-40 -mt-1 block ml-1 uppercase font-bold tracking-widest text-right">
                Previous: {stats.latest.odometer.toLocaleString()} km
              </span>
            )}

            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 ml-1 mt-1">Date & Time</label>
            <input required type="datetime-local" className="input input-sm input-bordered font-bold" value={fuelFormData.date} onChange={e => setFuelFormData({ ...fuelFormData, date: e.target.value })} />

            <div className="flex items-center justify-between mt-4 bg-base-200 p-3 rounded-lg border border-industrial-border">
              <label className="label cursor-pointer justify-start gap-4 p-0">
                <span className="label-text opacity-80 font-black uppercase text-[10px] tracking-widest">{fuelFormData.fuelType === 'ELECTRICITY' ? 'Full Charge' : 'Full tank'}</span>
                <input type="checkbox" className="toggle toggle-accent toggle-sm" checked={fuelFormData.isFullTank} onChange={e => setFuelFormData({ ...fuelFormData, isFullTank: e.target.checked })} />
              </label>

              {!fuelFormData.isFullTank && (
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-turbo-orange animate-pulse">
                    Auto-Calculating Level...
                  </span>
                  <p className="text-[8px] opacity-40 uppercase font-bold tracking-tighter">Carbon Intensity Segments Enabled</p>
                </div>
              )}
            </div>

            <button className="btn btn-accent btn-sm mt-4 font-['Rajdhani'] font-black uppercase tracking-widest">
              {fuelFormData.fuelType === 'ELECTRICITY' ? 'Charge // Initialize Log' : 'Refuel // Initialize Log'}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}

export default FuelEntryForm;
