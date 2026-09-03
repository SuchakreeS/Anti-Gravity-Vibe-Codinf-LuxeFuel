import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ASSETS } from '../../../utils/assets';

function AllCarsModal({ cars, selectedCar, setSelectedCar, onClose }) {
  return (
    <div className="fixed inset-0 bg-asphalt/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-['Rajdhani']">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="card bg-carbon shadow-2xl max-w-2xl w-full border border-industrial-border overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="h-1.5 bg-neon-violet shadow-neon shrink-0" />
        
        <div className="p-6 border-b border-industrial-border flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Fleet Inventory</h2>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-xs">
              Total Assets: {cars.length}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-asphalt border border-industrial-border flex items-center justify-center text-text-secondary hover:text-white hover:border-white transition-all"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="card-body p-6 overflow-y-auto space-y-3 custom-scrollbar">
          {cars.map(c => (
            <button
              key={c.id}
              className={`w-full text-left p-4 rounded-sm transition-all border flex items-center gap-4 ${
                selectedCar?.id === c.id
                ? 'bg-secondary text-secondary-content border-secondary shadow-neon'
                : 'bg-base-200 hover:bg-base-300 border-industrial-border text-text-primary'
              }`}
              onClick={() => {
                setSelectedCar(c);
                onClose();
              }}
            >
              <img
                src={c.photoUrl || ASSETS.DEFAULT_CAR}
                alt={c.name}
                className="w-16 h-16 rounded-sm object-cover border border-industrial-border"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-black uppercase italic text-lg tracking-tighter">{c.name}</div>
                  {c.engineType && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-asphalt border border-industrial-border text-text-secondary">
                      {c.engineType}
                    </span>
                  )}
                </div>
                <div className={`text-xs uppercase font-bold tracking-widest mt-1 ${selectedCar?.id === c.id ? 'opacity-90' : 'text-text-secondary'}`}>
                  {c.brand} {c.model} {c.licensePlate ? `• ${c.licensePlate}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default AllCarsModal;
