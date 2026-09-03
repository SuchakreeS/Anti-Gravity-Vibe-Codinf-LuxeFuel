import React from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, User } from 'lucide-react';
import { BADGES, getRank } from '../../utils/achievements';

const OperatorRankCard = ({ user, records = [] }) => {
  // Use a hardcoded score or derived from latest eco-pulse for now
  const score = records.length > 0 ? (records[records.length - 1].consumptionRate * 4 + 20) : 50;
  const rank = getRank(score, records.length);
  const unlockedBadges = BADGES.filter(b => b.check(records));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-carbon border border-industrial-border shadow-2xl relative"
    >
      <div className="card-body p-5 font-['Rajdhani']">
        {/* Header: Rank Telemetry */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className={`p-3 rounded-sm border ${rank.color.includes('emerald') ? 'border-emerald-500' : 'border-neon-violet'} bg-asphalt/50 shadow-neon`}>
              <User className={`w-8 h-8 ${rank.color.includes('emerald') ? 'text-emerald-500' : 'text-neon-violet'}`} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-carbon border border-industrial-border px-1.5 py-0.5 rounded-sm">
              <span className="text-[10px] font-black text-white">LVL {rank.level}</span>
            </div>
          </div>

          <div>
            <h3 className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">
              Operator Rank // Identity
            </h3>
            <h2 className={`text-2xl font-black italic tracking-tighter uppercase leading-none ${rank.color}`}>
              {rank.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1 w-24 bg-gauge-face border border-chrome/20 rounded-full overflow-hidden">
                <div className="h-full bg-neon-violet" style={{ width: `${(records.length / 20) * 100}%` }} />
              </div>
              <span className="text-[9px] font-bold text-led-amber font-mono uppercase">XP: {records.length}/20 Logs</span>
            </div>
          </div>
        </div>

        {/* Achievement Badges Grid */}
        <div className="relative z-20">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Unlockable Badges</span>
            <span className="text-[10px] font-black text-led-amber font-mono px-1.5 py-0.5 bg-gauge-face border border-chrome/20 rounded-sm">{unlockedBadges.length} / {BADGES.length}</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {BADGES.map((badge) => {
              const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`aspect-square flex items-center justify-center rounded-sm border transition-all duration-500 group relative hover:z-50
                    ${isUnlocked ? 'bg-neon-violet/10 border-neon-violet/40 shadow-neon' : 'bg-white/[0.02] border-industrial-border'}
                  `}
                >
                  <div className={`transition-all duration-500 ${!isUnlocked ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                    <span className="text-xl">{badge.icon}</span>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 p-3 bg-black border border-white/40 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-2xl">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-t border-l border-white/40 rotate-45" />
                    <p className="text-[10px] font-black text-neon-violet uppercase mb-1 tracking-widest">{badge.name}</p>
                    <p className="text-[10px] font-black text-white uppercase leading-normal tracking-wide">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Achievement Prompt */}
        <div className="mt-6 p-3 bg-asphalt/50 border border-industrial-border border-dashed rounded-sm">
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-turbo-orange" />
            <div>
              <p className="text-[9px] font-black text-white uppercase">Next Intel // Unlock Ghost Driver</p>
              <p className="text-[8px] text-text-primary uppercase tracking-tighter">Improve efficiency to 18 km/L to level up</p>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Accents */}
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        <Shield className="w-20 h-20 text-white" />
      </div>
    </motion.div>
  );
};

export default React.memo(OperatorRankCard);
