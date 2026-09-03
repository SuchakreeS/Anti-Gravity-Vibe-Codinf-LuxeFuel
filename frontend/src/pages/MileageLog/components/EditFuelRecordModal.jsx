import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

function EditFuelRecordModal({ isOpen, onClose, record, car, onSave }) {
  const [formData, setFormData] = useState({
    fuelCost: '',
    pricePerUnit: '',
    odometer: '',
    isFullTank: true,
    date: ''
  });

  useEffect(() => {
    if (record && isOpen) {
      const isEV = record.fuelType === 'ELECTRICITY';
      setFormData({
        fuelCost: record.fuelCost?.toFixed(2) || record.fuelCost || '',
        pricePerUnit: isEV ? (record.pricePerKwh?.toFixed(2) || '') : (record.pricePerLitre?.toFixed(2) || ''),
        odometer: record.odometer,
        isFullTank: record.isFullTank,
        date: new Date(record.date).toISOString().slice(0, 16)
      });
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const isEV = record.fuelType === 'ELECTRICITY';

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      fuelCost: parseFloat(formData.fuelCost),
      odometer: parseFloat(formData.odometer),
      isFullTank: formData.isFullTank,
      date: formData.date
    };
    
    if (isEV) {
      payload.pricePerKwh = parseFloat(formData.pricePerUnit);
    } else {
      payload.pricePerLitre = parseFloat(formData.pricePerUnit);
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-asphalt/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-['Rajdhani']">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="card bg-carbon shadow-2xl max-w-md w-full border border-industrial-border overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="h-1.5 bg-neon-violet shadow-neon shrink-0" />
        <div className="card-body p-5 relative overflow-y-auto custom-scrollbar">
          <button 
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-asphalt border border-industrial-border flex items-center justify-center text-text-secondary hover:text-white hover:border-white transition-all z-10"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          
          <h2 className="text-2xl font-black italic uppercase text-white mb-1 tracking-tighter pr-8">Edit Telemetry</h2>
          <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px] mb-4">Update logged session</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                {isEV ? 'Total Charging Cost' : 'Total Fuel Cost'}
              </label>
              <input 
                required 
                type="number" 
                step="0.01" 
                className="w-full bg-asphalt border border-industrial-border rounded-sm px-3 py-2 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet transition-all duration-300 font-bold text-sm"
                value={formData.fuelCost} 
                onChange={e => setFormData({ ...formData, fuelCost: e.target.value })} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                {isEV ? 'Price per kWh' : 'Price per Litre'}
              </label>
              <input 
                required 
                type="number" 
                step="0.01" 
                className="w-full bg-asphalt border border-industrial-border rounded-sm px-3 py-2 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet transition-all duration-300 font-bold text-sm"
                value={formData.pricePerUnit} 
                onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Odometer (km)</label>
              <input 
                required 
                type="number" 
                step="0.1" 
                className="w-full bg-asphalt border border-industrial-border rounded-sm px-3 py-2 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet transition-all duration-300 font-bold text-sm"
                value={formData.odometer} 
                onChange={e => setFormData({ ...formData, odometer: e.target.value })} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Date & Time</label>
              <input 
                required 
                type="datetime-local" 
                className="w-full bg-asphalt border border-industrial-border rounded-sm px-3 py-2 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet transition-all duration-300 font-bold text-sm"
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-asphalt border border-industrial-border rounded-sm mt-1">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-white">Full Capacity</span>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
                  {isEV ? 'Was the battery fully charged?' : 'Was the tank fully filled?'}
                </p>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-secondary border-industrial-border" 
                checked={formData.isFullTank} 
                onChange={e => setFormData({ ...formData, isFullTank: e.target.checked })} 
              />
            </div>

            <button type="submit" className="w-full bg-neon-violet hover:bg-white hover:text-asphalt text-white py-3 rounded-sm font-black text-lg uppercase tracking-tighter shadow-neon transition-all duration-300 mt-2">
              Commit Changes
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default EditFuelRecordModal;
