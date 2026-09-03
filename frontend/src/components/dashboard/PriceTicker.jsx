import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { z } from 'zod';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const THAI_OIL_API = 'https://api.chnwt.dev/thai-oil-api/latest';

// Dedicated client for this third-party API — separate from the app's own
// backend client, with its own timeout so a slow/unreachable third party
// can't hang this component indefinitely.
const thaiOilClient = axios.create({ timeout: 5000 });

const thaiOilResponseSchema = z.object({
  status: z.string(),
  response: z.object({
    date: z.string().optional(),
    stations: z.record(z.string(), z.record(z.string(), z.any()))
  })
});

// Cache across remounts (e.g. navigating away from and back to the
// Dashboard) instead of re-fetching from the third party every time.
const CACHE_TTL_MS = 5 * 60 * 1000;
let priceCache = null; // { data: { stations, date }, expiresAt }

// Which fuel types to display, mapped from the PTT station keys
const DISPLAY_FUELS = [
  { key: 'gasohol_95', label: 'Gasohol 95' },
  { key: 'gasohol_91', label: 'Gasohol 91' },
  { key: 'gasohol_e20', label: 'E20' },
  { key: 'diesel', label: 'Diesel' },
];

// Stations to compare for lowest price reference
const STATION_KEYS = ['ptt', 'bcp', 'shell', 'caltex', 'esso', 'irpc', 'pt', 'susco', 'pure'];

const TrendArrow = ({ current, average }) => {
  if (!average || !current) return null;
  const diff = current - average;
  if (Math.abs(diff) < 0.01) return <span className="text-text-secondary text-[10px] font-bold">—</span>;
  const isUp = diff > 0;
  return (
    <span className={`text-xs font-black inline-flex items-center gap-0.5 ${isUp ? 'text-turbo-orange' : 'text-emerald-500'}`}>
      {isUp ? <TrendingUp className="w-3 h-3" aria-hidden="true" /> : <TrendingDown className="w-3 h-3" aria-hidden="true" />} {Math.abs(diff).toFixed(2)}
    </span>
  );
};

const PriceTicker = () => {
  const [prices, setPrices] = useState(null);
  const [apiDate, setApiDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState('ptt');

  useEffect(() => {
    if (priceCache && priceCache.expiresAt > Date.now()) {
      setPrices(priceCache.data.stations);
      setApiDate(priceCache.data.date);
      setLoading(false);
      return;
    }

    const fetchPrices = async () => {
      try {
        setLoading(true);
        const res = await thaiOilClient.get(THAI_OIL_API);
        const parsed = thaiOilResponseSchema.safeParse(res.data);
        if (parsed.success && parsed.data.status === 'success') {
          const data = { stations: parsed.data.response.stations, date: parsed.data.response.date || '' };
          priceCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
          setPrices(data.stations);
          setApiDate(data.date);
        } else {
          console.error('Unexpected Thai oil price response shape', res.data);
          setError('Signal lost');
        }
      } catch (err) {
        console.error('Failed to fetch Thai oil prices', err);
        setError('Signal lost');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Calculate the average price across all stations for a given fuel key
  const getMarketAvg = (fuelKey) => {
    if (!prices) return null;
    let total = 0, count = 0;
    for (const station of STATION_KEYS) {
      const p = prices[station]?.[fuelKey]?.price;
      if (p) { total += parseFloat(p); count++; }
    }
    return count > 0 ? total / count : null;
  };

  // Get the station display data
  const stationData = prices?.[selectedStation];

  // Available stations from API data
  const availableStations = prices
    ? STATION_KEYS.filter(s => prices[s])
    : [];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-carbon border border-industrial-border rounded-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-industrial-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-violet animate-pulse shadow-neon" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
            🇹🇭 Thai Fuel Index // Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Station Selector */}
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-asphalt border border-industrial-border rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-text-secondary focus:outline-none focus:border-neon-violet cursor-pointer"
          >
            {availableStations.map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>

          <span className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-widest hidden sm:inline">
            {apiDate || '—'}
          </span>
        </div>
      </div>

      {/* Price Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-widest animate-pulse">
            <div className="w-2 h-2 rounded-full bg-turbo-orange animate-ping" />
            Syncing Fuel Data...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-turbo-orange text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> {error} // Retry later
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-industrial-border">
          {DISPLAY_FUELS.map(({ key, label }) => {
            const fuelData = stationData?.[key];
            const price = fuelData ? parseFloat(fuelData.price) : null;
            const avg = getMarketAvg(key);

            return (
              <div key={key} className="px-4 py-3 group hover:bg-asphalt transition-colors">
                <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 mb-1">
                  {label}
                </div>
                {price ? (
                  <>
                    <div className="inline-flex items-baseline gap-2 px-2 py-1 bg-gauge-face border border-chrome/20 rounded-sm">
                      <span className="text-lg font-black italic text-led-amber font-mono tabular-nums">
                        ฿{price.toFixed(2)}
                      </span>
                      <TrendArrow current={price} average={avg} />
                    </div>
                    <div className="text-[8px] font-bold text-text-secondary/30 uppercase tracking-widest mt-1">
                      mkt avg ฿{avg?.toFixed(2) || '—'}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-text-secondary/30 italic">N/A</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default PriceTicker;
