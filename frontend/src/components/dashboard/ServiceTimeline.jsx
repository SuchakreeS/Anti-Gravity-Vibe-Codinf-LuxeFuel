import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Fuel, Wrench, Settings, ClipboardList } from 'lucide-react';
import { useCurrencyStore } from '../../store/useCurrencyStore';
import { MAINTENANCE_CATEGORIES } from '../../utils/maintenance';

const ServiceTimeline = ({ records = [], car, onOpenMaintenance }) => {
  const { symbol, convert } = useCurrencyStore();

  // Parse maintenance data from car
  let maintenance = {};
  try {
    maintenance = car?.maintenanceData ? JSON.parse(car.maintenanceData) : {};
  } catch (e) {
    maintenance = {};
  }

  // Build timeline entries from fuel records
  const fuelEntries = records.map(r => ({
    id: `fuel-${r.id}`,
    type: r.isFullTank ? 'fuel-full' : 'service',
    date: new Date(r.date),
    title: r.isFullTank ? 'Full Tank Refuel' : 'Service / Partial Fill',
    subtitle: r.consumptionRate
      ? `${r.consumptionRate.toFixed(2)} km/L • ${r.distanceTraveled} km`
      : `+${r.distanceTraveled || 0} km`,
    cost: r.fuelCost,
    odometer: r.odometer,
  }));

  // Build timeline entries from maintenance history
  const maintenanceEntries = Object.entries(maintenance)
    .filter(([, data]) => data?.serviceDate)
    .map(([key, data]) => ({
      id: `maint-${key}`,
      type: 'maintenance',
      date: new Date(data.serviceDate || data.lastServiceDate),
      title: MAINTENANCE_CATEGORIES[key]?.label || key,
      subtitle: `Service at ${(data.odometer || 0).toLocaleString()} km`,
      cost: data.cost || 0,
      odometer: data.odometer || 0,
    }));

  // Merge and sort by date descending
  const timeline = [...fuelEntries, ...maintenanceEntries]
    .sort((a, b) => b.date - a.date)
    .slice(0, 20); // Show last 20 entries

  const getTypeStyles = (type) => {
    switch (type) {
      case 'fuel-full':
        return { dot: 'bg-neon-violet shadow-neon', Icon: Fuel };
      case 'service':
        return { dot: 'bg-turbo-orange shadow-[0_0_10px_rgba(249,115,22,0.4)]', Icon: Wrench };
      case 'maintenance':
        return { dot: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]', Icon: Settings };
      default:
        return { dot: 'bg-text-secondary', Icon: ClipboardList };
    }
  };

  if (timeline.length === 0) {
    return (
      <div className="bg-carbon border border-industrial-border rounded-sm p-8 text-center">
        <p className="text-text-secondary text-sm uppercase tracking-widest font-bold">
          No service history yet
        </p>
        <p className="text-text-secondary/40 text-[10px] uppercase tracking-widest mt-2">
          Add fuel or maintenance records to populate the timeline
        </p>
      </div>
    );
  }

  return (
    <div className="bg-carbon border border-industrial-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-industrial-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-violet animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
            Service Timeline // History
          </span>
        </div>
        <span className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-widest">
          {timeline.length} Entries
        </span>
      </div>

      {/* Timeline */}
      <div className="relative px-5 py-4">
        {/* Vertical line */}
        <div className="absolute left-[29px] top-4 bottom-4 w-[2px] bg-jdm-purple/40" />

        <div className="space-y-1">
          {timeline.map((entry, i) => {
            const styles = getTypeStyles(entry.type);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                viewport={{ once: true, margin: '-20px' }}
                className="relative flex items-start gap-4 group"
              >
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0 mt-3">
                  <div className={`w-3 h-3 rounded-full ${styles.dot} ring-2 ring-carbon`} />
                </div>

                {/* Card */}
                <div className="flex-1 bg-asphalt border border-industrial-border rounded-sm p-3 hover:border-neon-violet/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all duration-300 group-hover:translate-x-1 mb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <styles.Icon className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
                        <span className="text-xs font-black uppercase tracking-wider text-white truncate">
                          {entry.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                        {entry.subtitle}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-black italic text-led-amber font-mono tabular-nums px-2 py-0.5 bg-gauge-face border border-chrome/20 rounded-sm inline-block">
                        {symbol()}{convert(entry.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-text-secondary/40 font-bold uppercase tracking-widest">
                        {format(entry.date, "dd MMM ''yy")}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Footer */}
      {onOpenMaintenance && (
        <div className="px-5 py-3 border-t border-industrial-border">
          <button
            onClick={onOpenMaintenance}
            className="w-full bg-jdm-purple/20 hover:bg-neon-violet/20 border border-neon-violet/30 hover:border-neon-violet text-neon-violet rounded-sm py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-neon"
          >
            + Quick Add // Log Service
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceTimeline;
