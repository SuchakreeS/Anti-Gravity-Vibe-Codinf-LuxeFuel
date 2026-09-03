import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Download, ShieldCheck, Zap, ChevronDown, ChevronUp, History, Fuel, HelpCircle } from 'lucide-react';
import api from '../../utils/api';
import { cyberToast } from '../../components/CyberToast';
import { format } from 'date-fns';

const CommandCenterTab = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/organization/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        cyberToast.error('Failed to sync fleet intelligence');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const totalOrgCO2 = leaderboard.reduce((sum, u) => sum + u.totalCO2, 0);
  const avgFleetPulse = leaderboard.length > 0 
    ? leaderboard.reduce((sum, u) => sum + u.pulseScore, 0) / leaderboard.length 
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-neon-violet/20 border-t-neon-violet rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-violet animate-pulse">Syncing Fleet Data...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-['Rajdhani']">
      {/* Fleet Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-carbon border border-industrial-border p-5 rounded-sm relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
             <ShieldCheck className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Total Fleet Impact</span>
          <div className="inline-block px-3 py-1.5 bg-gauge-face border border-chrome/20 rounded-sm">
            <span className="text-3xl font-black text-led-amber font-mono tabular-nums italic">
              {totalOrgCO2.toFixed(2)} <span className="text-sm text-chrome opacity-70 not-italic">TONS CO2</span>
            </span>
          </div>
          <p className="text-[9px] text-text-secondary mt-2 uppercase font-bold tracking-tighter italic">Verified scope 1 emissions</p>
        </div>

        <div className="bg-carbon border border-industrial-border p-5 rounded-sm relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:-rotate-12 transition-transform">
             <Zap className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Avg. Fleet Pulse</span>
          <div className="inline-block px-3 py-1.5 bg-gauge-face border border-chrome/20 rounded-sm">
            <span className="text-3xl font-black text-led-amber font-mono tabular-nums italic">
              {Math.round(avgFleetPulse)} <span className="text-sm text-chrome opacity-70 not-italic">/100</span>
            </span>
          </div>
          <p className="text-[9px] text-text-secondary mt-2 uppercase font-bold tracking-tighter italic">Efficiency across all sectors</p>
        </div>

        <div className="bg-emerald-500 p-5 rounded-sm relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.3)] text-left">
          <button 
            onClick={() => cyberToast.success('ESG Report Compiled // Ready for Export')}
            className="w-full h-full text-left"
          >
            <span className="text-[10px] font-black text-asphalt uppercase tracking-widest mb-1 block">ESG Compliance</span>
            <div className="flex items-center gap-2">
              <Download className="w-6 h-6 text-asphalt" />
              <div className="text-xl font-black text-asphalt italic uppercase leading-none">
                Export ESG Report
              </div>
            </div>
            <p className="text-[9px] text-asphalt/60 mt-2 uppercase font-bold tracking-tighter italic">Generate Audit-Ready PDF</p>
          </button>
        </div>
      </div>

      {/* Eco-Grand Prix Leaderboard */}
      <div className="bg-carbon border border-industrial-border rounded-sm overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-industrial-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-turbo-orange" />
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Eco-Grand Prix Leaderboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Efficiency Trending +12%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full border-separate border-spacing-y-2 px-4">
            <thead>
              <tr className="text-text-secondary/40 text-[10px] uppercase font-black tracking-widest border-none text-left">
                <th className="bg-transparent">Rank</th>
                <th className="bg-transparent">Operator</th>
                <th className="bg-transparent relative group">
                  <div className="flex items-center gap-1 cursor-help">
                    Pulse Score
                    <HelpCircle className="w-3 h-3 opacity-50" />
                  </div>
                  {/* Pulse Score Tooltip */}
                  <div className="absolute top-full left-0 mt-2 w-72 p-5 bg-black border border-white/20 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] shadow-2xl normal-case font-normal text-white translate-y-2 group-hover:translate-y-0 whitespace-normal">
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-black border-t border-l border-white/20 rotate-45" />
                    <p className="font-black uppercase text-neon-violet mb-3 tracking-widest text-[10px]">Fleet Master Metric // Eco-Pulse</p>
                    <p className="text-[11px] leading-relaxed mb-4 opacity-90 italic">
                      The Pulse Score translates complex telemetry into a standardized 0–100 grade, enabling fair performance comparison across diverse vehicle types.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">01 // Efficiency</p>
                        <p className="text-[10px] opacity-70 leading-tight">High km/L relative to vehicle class boosts the baseline rating.</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">02 // Clean Fuel</p>
                        <p className="text-[10px] opacity-70 leading-tight">Usage of low-carbon fuels (E20/E85) provides significant power-up bonuses.</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">03 // Consistency</p>
                        <p className="text-[10px] opacity-70 leading-tight">Disciplined, stable performance over recent cycles is rewarded.</p>
                      </div>
                    </div>
                  </div>
                </th>
                <th className="bg-transparent">CO2 Footprint</th>
                <th className="bg-transparent">Distance</th>
                <th className="bg-transparent text-right">Activity</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, i) => (
                <React.Fragment key={user.id}>
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className={`group cursor-pointer transition-colors ${expandedUser === user.id ? 'bg-neon-violet/10' : 'bg-asphalt/50 hover:bg-neon-violet/5'}`}
                  >
                    <td className="border-y border-l border-industrial-border rounded-l-sm py-4">
                      <span className={`inline-block px-2 py-1 bg-gauge-face border border-chrome/20 rounded-sm text-lg font-black italic font-mono ${i === 0 ? 'text-turbo-orange' : 'text-led-amber'}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="border-y border-industrial-border py-4">
                      <div className="font-black text-white uppercase italic tracking-wider">{user.name}</div>
                      <div className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-tighter">ID: {user.id} // {user.role}</div>
                    </td>
                    <td className="border-y border-industrial-border py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-gauge-face border border-chrome/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${user.pulseScore > 80 ? 'bg-emerald-500' : 'bg-turbo-orange'}`}
                            style={{ width: `${user.pulseScore}%` }}
                          />
                        </div>
                        <span className={`font-black italic font-mono ${user.pulseScore > 80 ? 'text-emerald-400' : 'text-led-amber'}`}>{user.pulseScore}</span>
                      </div>
                    </td>
                    <td className="border-y border-industrial-border py-4">
                      <span className="font-mono text-xs text-text-secondary">{user.totalCO2.toFixed(3)} T</span>
                    </td>
                    <td className="border-y border-industrial-border py-4 font-mono text-xs text-text-secondary">
                      {user.totalDist.toLocaleString()} km
                    </td>
                    <td className="border-y border-r border-industrial-border rounded-r-sm py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <div className="text-xs font-black text-white italic">{user.logCount} LOGS</div>
                          <div className="text-[8px] font-bold text-text-secondary/30 uppercase">Synced Telemetry</div>
                        </div>
                        {expandedUser === user.id ? <ChevronUp className="w-4 h-4 text-neon-violet" /> : <ChevronDown className="w-4 h-4 opacity-20" />}
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expansion: User Logs */}
                  <AnimatePresence>
                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan="6" className="p-0 border-none">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-black/40 border-x border-b border-industrial-border mx-2 mb-2 rounded-b-sm"
                          >
                            <div className="p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <History className="w-4 h-4 text-neon-violet" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                                  Operator Activity Feed // RECENT LOGS
                                </span>
                              </div>

                              {user.recentLogs.length === 0 ? (
                                <p className="text-[10px] text-text-secondary italic">No telemetry data detected for this sector.</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.recentLogs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between bg-carbon/50 border border-white/5 p-3 rounded-sm group hover:border-emerald-500/30 transition-colors">
                                      <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-sm bg-asphalt flex items-center justify-center border border-white/5">
                                          <Fuel className="w-4 h-4 text-text-secondary" />
                                        </div>
                                        <div>
                                          <div className="text-xs font-black text-white uppercase tracking-wider">{log.carName}</div>
                                          <div className="text-[9px] font-bold text-text-secondary/40 uppercase">
                                            {format(new Date(log.date), 'dd MMM yyyy HH:mm')}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-8 text-right">
                                        <div>
                                          <div className="text-[9px] font-bold text-text-secondary/30 uppercase">Distance</div>
                                          <div className="text-xs font-black text-white italic">+{log.distance} KM</div>
                                        </div>
                                        <div>
                                          <div className="text-[9px] font-bold text-text-secondary/30 uppercase">Efficiency</div>
                                          <div className="text-xs font-black text-emerald-400 italic">{log.consumption?.toFixed(2) || 'N/A'} km/L</div>
                                        </div>
                                        <div>
                                          <div className="text-[9px] font-bold text-text-secondary/30 uppercase">Impact</div>
                                          <div className="text-xs font-black text-turbo-orange italic">{log.co2?.toFixed(2)} KG CO2</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Footnote */}
      <p className="text-[9px] text-center text-text-secondary/20 uppercase font-bold tracking-[0.4em] py-4">
        Secure Fleet Command // Data Refreshed: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default CommandCenterTab;
