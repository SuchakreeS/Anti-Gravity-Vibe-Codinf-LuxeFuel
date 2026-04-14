import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrencyStore } from '../../../store/useCurrencyStore';

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length && payload[0].value != null && payload[0].payload) {
    const { displayDate, displayTime } = payload[0].payload;
    return (
      <div className="bg-[#1f1f1f] p-4 shadow-2xl rounded-xl border border-white/10 flex flex-col items-center min-w-[150px] relative z-[9999]">
        <p className="text-2xl font-bold text-white leading-none">
          {prefix}{payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="mt-3 flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-white/50">{displayDate || label}</p>
          <p className="text-[11px] font-bold text-white/30 tracking-wider">
            {displayTime || '??:??'} UTC+7
          </p>
        </div>
      </div>
    );
  }
  return null;
};

function DashboardCharts({ records, convertedRecords }) {
  const { currency, symbol } = useCurrencyStore();

  return (
    <div className="lg:col-span-2 flex flex-col gap-6">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">1. Consumption Rate / Time</h2>
          <div className="h-64 overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records} margin={{ top: 20, right: 50, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 11 }}
                  dy={10}
                  tickFormatter={(id) => {
                    const record = records.find(r => r.id === id);
                    return record ? record.xAxisLabel : '';
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} dx={-10} />
                <Tooltip
                  content={<CustomTooltip suffix="km/L" />}
                  cursor={false}
                  wrapperStyle={{ zIndex: 1000 }}
                  allowEscapeViewBox={{ x: false, y: true }}
                />
                <Area isAnimationActive={false} type="monotone" connectNulls={true} dataKey="consumptionRate" name="km/L" stroke="#22c55e" fillOpacity={1} fill="url(#colorConsumption)" strokeWidth={6} dot={{ r: 4, fill: "#22c55e", strokeWidth: 0, opacity: 1 }} activeDot={{ r: 8, strokeWidth: 0, fill: "#22c55e" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">2. Gas Price Refueled / Time ({currency})</h2>
          <div className="h-64 overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convertedRecords} margin={{ top: 20, right: 50, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 11 }}
                  dy={10}
                  tickFormatter={(id) => {
                    const record = convertedRecords.find(r => r.id === id);
                    return record ? record.xAxisLabel : '';
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} dx={-10} />
                <Tooltip
                  content={<CustomTooltip prefix={symbol()} suffix={currency} />}
                  cursor={false}
                  wrapperStyle={{ zIndex: 1000 }}
                  allowEscapeViewBox={{ x: false, y: true }}
                />
                <Area isAnimationActive={false} type="monotone" dataKey="convertedFuelCost" name={`Total Cost (${currency})`} stroke="#22c55e" fillOpacity={1} fill="url(#colorCost)" strokeWidth={6} dot={{ r: 4, fill: "#22c55e", strokeWidth: 0, opacity: 1 }} activeDot={{ r: 8, strokeWidth: 0, fill: "#22c55e" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">3. Gas Price Per Litre ({currency})</h2>
          <div className="h-64 overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convertedRecords} margin={{ top: 20, right: 50, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 11 }}
                  dy={10}
                  tickFormatter={(id) => {
                    const record = convertedRecords.find(r => r.id === id);
                    return record ? record.xAxisLabel : '';
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} dx={-10} />
                <Tooltip
                  content={<CustomTooltip prefix={symbol()} suffix={`${currency} / L`} />}
                  cursor={false}
                  wrapperStyle={{ zIndex: 1000 }}
                  allowEscapeViewBox={{ x: false, y: true }}
                />
                <Area isAnimationActive={false} type="monotone" dataKey="convertedPricePerLitre" name={`${currency} / L`} stroke="#22c55e" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={6} dot={{ r: 4, fill: "#22c55e", strokeWidth: 0, opacity: 1 }} activeDot={{ r: 8, strokeWidth: 0, fill: "#22c55e" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardCharts;
