import React, { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useCurrencyStore } from '../../../store/useCurrencyStore';
import FuelGauge from '../../../components/dashboard/FuelGauge';

function DashboardStats({ stats, car, useHundredKm, setUseHundredKm }) {
  const { symbol } = useCurrencyStore();
  
  if (!stats) return null;
  const { latest, avgConsumption, fullTankCount, comparison, totalSpent, avgCostPerKm } = stats;

  const getUnit = () => {
    if (car?.engineType === 'EV') {
      return useHundredKm ? 'kWh/100km' : 'km/kWh';
    }
    return useHundredKm ? 'L/100km' : 'km/L';
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    const processed = useHundredKm ? (100 / val) : val;
    return processed.toFixed(2);
  };

  const unit = getUnit();

  return (
    <div className="flex flex-col gap-3">
      {/* 1. System Status Gauge */}
      {latest && latest.fuelLevel !== null && (
        <FuelGauge 
          level={latest.fuelLevel} 
          engineType={car?.engineType} 
        />
      )}

      {/* 2. Financial Stats Summary — rendered as a dark instrument readout
          (like a trip computer's digital display) so the numbers stay
          legible and on-theme in both light and dark mode. */}
      <div className="stats shadow-2xl w-full bg-gauge-face border border-chrome/20 text-text-primary">
        <div className="stat px-4 py-3">
          <div className="stat-title text-chrome text-[10px] font-black uppercase tracking-widest">Total Spent</div>
          <div className="stat-value text-2xl font-black italic text-led-amber font-mono tabular-nums drop-shadow-[0_0_8px_rgba(255,176,32,0.35)]">
            {symbol()}{totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>
        <div className="stat px-4 py-3 border-l border-chrome/20">
          <div className="stat-title text-chrome text-[10px] font-black uppercase tracking-widest">Avg Cost/km</div>
          <div className="stat-value text-xl font-bold font-mono tabular-nums text-led-amber">
            {avgCostPerKm ? `${symbol()}${avgCostPerKm.toFixed(2)}` : 'N/A'}
          </div>
        </div>
      </div>

      {(!latest.isFullTank || latest.consumptionRate === null) ? (
        <div className="flex flex-col gap-3">
          <div className="stats shadow-2xl w-full bg-carbon border border-industrial-border text-text-primary">
            <div className="stat">
              <div className="stat-title text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-60">Partially Filled</div>
              <div className="stat-value text-lg text-neon-violet uppercase font-black tracking-tighter italic">Pending Calibration</div>
              <div className="stat-desc text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-40">Distance: +{latest.distanceTraveled} km</div>
            </div>
          </div>
          {avgConsumption !== null && (
            <div className="stats shadow-2xl w-full bg-carbon border border-industrial-border">
              <div className="stat">
                <div className="stat-title text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-60">Avg. Consumption</div>
                <div className="stat-value text-lg text-text-primary font-black italic">{formatValue(avgConsumption)} {unit}</div>
                <div className="stat-desc text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-40">From {fullTankCount} full fill-ups</div>
              </div>
            </div>
          )}
        </div>
      ) : !comparison ? (
        <div className="flex flex-col gap-3">
          <div className="stats shadow-2xl w-full bg-neon-violet/20 border border-neon-violet text-white">
            <div className="stat">
              <div className="stat-title text-neon-violet uppercase text-[10px] font-black tracking-widest">First Full Fill-up</div>
              <div className="stat-value text-white font-black italic">{formatValue(latest.consumptionRate)} {unit}</div>
              <div className="stat-desc text-neon-violet/70 uppercase text-[9px] font-bold tracking-widest">Baseline established</div>
            </div>
          </div>
          <div className="stats shadow-2xl w-full bg-carbon border border-industrial-border">
            <div className="stat">
              <div className="stat-title text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-60">Avg. Consumption</div>
              <div className="stat-value text-lg text-text-primary font-black italic">{formatValue(latest.consumptionRate)} {unit}</div>
              <div className="stat-desc text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-40">From 1 full fill-up</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={`stats shadow-2xl w-full stats-vertical sm:stats-horizontal border border-industrial-border ${comparison.isEfficiencyImproved ? 'bg-emerald-950/30 text-emerald-400' : 'bg-rose-950/30 text-rose-400'}`}>
            <div className="stat">
              <div className="stat-title text-current opacity-80 uppercase text-[10px] font-black tracking-widest">Latest</div>
              <div className="stat-value font-black italic">{formatValue(comparison.latest)}</div>
              <div className="stat-desc text-current opacity-70 font-black uppercase text-[9px] tracking-widest">{unit}</div>
            </div>
            <div className="stat border-l border-industrial-border">
              <div className="stat-title text-current opacity-80 uppercase text-[10px] font-black tracking-widest">Previous</div>
              <div className="stat-value font-black italic">{formatValue(comparison.previous)}</div>
              <div className="stat-desc text-current opacity-70 font-black uppercase text-[9px] tracking-widest">{unit}</div>
            </div>
          </div>

          <div className={`stats shadow-2xl w-full border border-industrial-border ${comparison.isEfficiencyImproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            <div className="stat py-2 items-center text-center">
              <div className="stat-title text-current opacity-80 text-[10px] uppercase font-black tracking-widest">Difference</div>
              <div className="stat-value text-2xl font-black italic flex items-center justify-center gap-2 tracking-tighter">
                {comparison.isEfficiencyImproved
                  ? <TrendingDown className="w-5 h-5" aria-hidden="true" />
                  : <TrendingUp className="w-5 h-5" aria-hidden="true" />}
                {useHundredKm
                  ? `${(100/comparison.latest - 100/comparison.previous).toFixed(2)}`
                  : `${(comparison.isEfficiencyImproved ? '+' : '')}${comparison.diff.toFixed(2)}`
                }
              </div>
              <div className="stat-desc text-current opacity-80 text-[10px] uppercase font-black tracking-widest mt-1">
                {comparison.isEfficiencyImproved ? 'Optimized' : 'High Load'} Output
              </div>
            </div>
          </div>
          
          {avgConsumption !== null && (
            <div className="stats shadow-2xl w-full bg-carbon border border-industrial-border">
              <div className="stat">
                <div className="stat-title text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-60">Avg. Consumption</div>
                <div className="stat-value text-lg text-text-primary font-black italic">{formatValue(avgConsumption)} {unit}</div>
                <div className="stat-desc text-text-secondary text-[10px] uppercase font-bold tracking-widest opacity-40">From {fullTankCount} full fill-ups</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardStats;
