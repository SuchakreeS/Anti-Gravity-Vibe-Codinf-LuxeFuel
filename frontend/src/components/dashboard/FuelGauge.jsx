import React from 'react';
import { motion } from 'framer-motion';
import { Fuel, Zap } from 'lucide-react';

const FuelGauge = ({ level, engineType }) => {
  const isLow = level <= 20;
  const isVeryLow = level <= 10;
  const isEV = engineType === 'EV';

  // Determine color based on level
  const getLevelColor = () => {
    if (isVeryLow) return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]';
    if (isLow) return 'bg-turbo-orange shadow-[0_0_15px_rgba(249,115,22,0.6)]';
    return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]';
  };

  const getTextColor = () => {
    if (isVeryLow) return 'text-rose-400';
    if (isLow) return 'text-turbo-orange';
    return 'text-emerald-400';
  };

  return (
    <div className="bg-asphalt/50 border border-industrial-border rounded-sm p-4 flex flex-col items-center gap-3 relative overflow-hidden group">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '12px 12px' }} 
      />

      <div className="flex justify-between w-full items-start z-10">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60">
            {isEV ? 'Battery Charge' : 'Fuel Reserves'}
          </span>
          <h4 className="text-white text-xs font-black italic uppercase tracking-tighter">
            System Status
          </h4>
        </div>
        {isEV ? (
          <Zap className={`w-4 h-4 ${getTextColor()} animate-pulse`} />
        ) : (
          <Fuel className={`w-4 h-4 ${getTextColor()} ${isLow ? 'animate-bounce' : ''}`} />
        )}
      </div>

      {/* The Gauge Visual — the face stays dark-glass in both themes, like a
          real instrument cluster; only the trim around it follows the theme. */}
      <div className="w-full h-4 bg-gauge-face rounded-full border border-chrome/30 p-[2px] relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full transition-colors duration-500 ${getLevelColor()}`}
        />
      </div>

      <div className="flex justify-between w-full items-end z-10">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-black italic tracking-tighter ${getTextColor()} drop-shadow-sm`}>
            {Math.round(level)}
          </span>
          <span className="text-xs font-bold text-text-secondary opacity-50 uppercase">%</span>
        </div>
        
        <div className="text-right">
          <p className={`text-[10px] font-black uppercase tracking-widest ${getTextColor()}`}>
            {isVeryLow ? 'CRITICAL' : isLow ? 'LOW LEVEL' : 'OPTIMAL'}
          </p>
          <p className="text-[8px] text-text-secondary uppercase font-bold tracking-tighter opacity-40">
            Telemetry Validated
          </p>
        </div>
      </div>

      {/* Warning Overlay for Critical State */}
      {isVeryLow && (
        <motion.div 
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-rose-500 pointer-events-none"
        />
      )}
    </div>
  );
};

export default React.memo(FuelGauge);
