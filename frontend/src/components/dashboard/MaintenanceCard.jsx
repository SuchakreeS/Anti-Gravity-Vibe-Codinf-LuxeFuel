import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Settings, CheckCircle2 } from 'lucide-react';
import { calculateHealth, getHealthColor, MAINTENANCE_CATEGORIES } from '../../utils/maintenance';

const MaintenanceCard = ({ car, currentMileage, onOpenService }) => {
  // Parse maintenance data
  let maintenance = {};
  try {
    maintenance = car.maintenanceData ? JSON.parse(car.maintenanceData) : {};
  } catch (e) {
    console.error('Failed to parse maintenance data', e);
  }

  // Calculate health for each category and get the minimum (overall health)
  const categoryHealths = Object.entries(MAINTENANCE_CATEGORIES).map(([key, cat]) => {
    const history = maintenance[key] || {};
    const lastKm = history.odometer || 0;
    const lastDate = history.serviceDate || car.createdAt || new Date();
    
    return {
      key,
      label: cat.label,
      health: calculateHealth(lastKm, lastDate, cat.intervalKm, cat.intervalMonths, currentMileage)
    };
  });

  const overallHealth = Math.round(
    categoryHealths.reduce((sum, c) => sum + c.health, 0) / categoryHealths.length
  );
  const minHealth = Math.min(...categoryHealths.map(c => c.health));
  const healthColor = getHealthColor(overallHealth);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-carbon border border-industrial-border shadow-2xl overflow-hidden relative"
    >
      <div className="card-body p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-1">
              Predictive Maintenance
            </h3>
            <h2 className="text-text-primary text-xl font-black italic">VEHICLE HEALTH</h2>
          </div>
          <div className="text-right px-3 py-1.5 bg-gauge-face border border-chrome/20 rounded-sm">
            <span className="text-2xl font-mono font-bold tabular-nums" style={{ color: healthColor }}>
              {overallHealth}%
            </span>
          </div>
        </div>

        {/* Overall Progress Bar — dark gauge-face track with a chrome bezel,
            same instrument look as FuelGauge.jsx's track. */}
        <div className="relative h-4 w-full bg-gauge-face rounded-sm border border-chrome/30 p-[2px] mb-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallHealth}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: healthColor }}
          />
        </div>

        {/* Category Specifics */}
        <div className="space-y-3 mb-6">
          {categoryHealths.map((cat) => (
            <div key={cat.key} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-text-secondary">{cat.label}</span>
                <span style={{ color: getHealthColor(cat.health) }}>{cat.health}%</span>
              </div>
              <div className="h-1 w-full bg-gauge-face border border-chrome/20 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${cat.health}%`, backgroundColor: getHealthColor(cat.health) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-industrial-border flex items-center justify-between">
          <span className="text-[10px] text-text-secondary font-bold italic uppercase inline-flex items-center gap-1.5">
            {minHealth < 30
              ? <><AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> IMMEDIATE SERVICE REQUIRED</>
              : minHealth < 80
                ? <><Settings className="w-3.5 h-3.5" aria-hidden="true" /> SERVICE RECOMMENDED SOON</>
                : <><CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> OPTIMAL CONDITION</>}
          </span>
          <button
            onClick={onOpenService}
            className="btn btn-xs bg-emerald-500 hover:bg-emerald-400 border-none text-slate-950 font-black px-4 rounded-sm"
          >
            LOG SERVICE
          </button>
        </div>
      </div>

      {/* Industrial aesthetic details */}
      <div className="absolute top-0 right-0 p-1 opacity-10 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M0 0 L40 40 M40 0 L0 40" stroke="white" strokeWidth="1" />
        </svg>
      </div>
    </motion.div>
  );
};

export default MaintenanceCard;
