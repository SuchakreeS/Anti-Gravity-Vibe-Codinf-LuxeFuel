import React from 'react';

function DashboardStats({ stats }) {
  if (!stats) return null;
  const { latest, avgConsumption, fullTankCount, comparison } = stats;

  if (!latest.isFullTank || latest.consumptionRate === null) {
    return (
      <div className="flex flex-col gap-3">
        <div className="stats shadow w-full bg-base-300 text-base-content border border-base-200">
          <div className="stat">
            <div className="stat-title opacity-80">Partially Filled</div>
            <div className="stat-value text-xl">Waiting for next Full Tank</div>
            <div className="stat-desc opacity-90">Distance added: +{latest.distanceTraveled} km</div>
          </div>
        </div>
        {avgConsumption !== null && (
          <div className="stats shadow w-full bg-base-100 border border-base-200">
            <div className="stat">
              <div className="stat-title opacity-80">Avg. Consumption</div>
              <div className="stat-value text-lg">{avgConsumption.toFixed(2)} km/L</div>
              <div className="stat-desc opacity-70">From {fullTankCount} full fill-ups</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex flex-col gap-3">
        <div className="stats shadow w-full bg-info text-info-content">
          <div className="stat">
            <div className="stat-title opacity-80 text-info-content">First Full Fill-up</div>
            <div className="stat-value text-info-content">{latest.consumptionRate.toFixed(2)} km/L</div>
            <div className="stat-desc opacity-90 text-info-content">Baseline established</div>
          </div>
        </div>
        <div className="stats shadow w-full bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-title opacity-80">Avg. Consumption</div>
            <div className="stat-value text-lg">{latest.consumptionRate.toFixed(2)} km/L</div>
            <div className="stat-desc opacity-70">From 1 full fill-up</div>
          </div>
        </div>
      </div>
    );
  }

  const { latest: latestRate, previous, diff, isEfficiencyImproved } = comparison;

  return (
    <div className="flex flex-col gap-3">
      <div className={`stats shadow w-full stats-vertical sm:stats-horizontal ${isEfficiencyImproved ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
        <div className="stat">
          <div className="stat-title text-current opacity-80">Latest</div>
          <div className="stat-value">{latestRate.toFixed(2)}</div>
          <div className="stat-desc text-current opacity-70 font-medium">km/L</div>
        </div>
        <div className="stat border-l border-current/10">
          <div className="stat-title text-current opacity-80">Previous</div>
          <div className="stat-value">{previous.toFixed(2)}</div>
          <div className="stat-desc text-current opacity-70 font-medium">km/L</div>
        </div>
      </div>

      <div className={`stats shadow w-full ${isEfficiencyImproved ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
        <div className="stat py-2 items-center text-center">
          <div className="stat-title text-current opacity-80 text-xs uppercase font-bold tracking-wider">Difference</div>
          <div className="stat-value text-2xl font-bold flex items-center justify-center gap-2">
            {isEfficiencyImproved ? '📉' : '📈'} {isEfficiencyImproved ? '+' : ''}{diff.toFixed(2)}
          </div>
          <div className="stat-desc text-current opacity-80 text-sm font-medium">
            {isEfficiencyImproved ? 'Lower' : 'Higher'} Consumption
          </div>
        </div>
      </div>
      
      {avgConsumption !== null && (
        <div className="stats shadow w-full bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-title opacity-80">Avg. Consumption</div>
            <div className="stat-value text-lg">{avgConsumption.toFixed(2)} km/L</div>
            <div className="stat-desc opacity-70">From {fullTankCount} full fill-ups</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardStats;
