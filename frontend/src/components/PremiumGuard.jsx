import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const PremiumGuard = ({ planRequired = 'PRO', children }) => {
  const hasPlan = useAuthStore((state) => state.hasPlan);
  const isAllowed = hasPlan(planRequired);

  if (isAllowed) {
    return <>{children}</>;
  }

  // Never render the real (gated) content into the DOM for non-eligible
  // plans — a CSS blur is trivially defeated via devtools/inspect element.
  // Show a generic skeleton in its place instead, so the layout footprint
  // still looks right without exposing any underlying data.
  return (
    <div className="relative group border border-border rounded-xl overflow-hidden h-full min-h-[320px]">
      <div aria-hidden="true" className="p-5 h-full animate-pulse">
        <div className="h-6 w-2/3 bg-gauge-face border border-chrome/10 rounded-sm mb-4" />
        <div className="h-4 w-1/2 bg-gauge-face border border-chrome/10 rounded-sm mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gauge-face border border-chrome/10 rounded-sm" />
          <div className="h-20 bg-gauge-face border border-chrome/10 rounded-sm" />
        </div>
      </div>

      {/* Luxe Lock Overlay */}
      <AnimatePresence appear>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-asphalt/60 backdrop-blur-sm p-6 text-center"
        >
          {/* Lock Icon with Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-4"
          >
            <div className="p-4 bg-jdm-purple/20 rounded-full border border-neon-violet/30 shadow-neon">
              <Lock className="w-10 h-10 text-neon-violet" />
            </div>
          </motion.div>

          {/* Text in Rajdhani font */}
          <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider mb-1">
            Unlock {planRequired} Feature
          </h3>
          <p className="text-text-secondary text-[10px] uppercase font-bold tracking-tighter mb-4 max-w-[200px] opacity-70">
            Professional Grade Telemetry & Analytics
          </p>

          {/* CTA Button */}
          <Link
            to="/pricing"
            className="btn btn-xs bg-jdm-purple hover:bg-neon-violet text-white border-none rounded-none px-6 font-rajdhani font-bold tracking-widest shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            UPGRADE NOW
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PremiumGuard;
