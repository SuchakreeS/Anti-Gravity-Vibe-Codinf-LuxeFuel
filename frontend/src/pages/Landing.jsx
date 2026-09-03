import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fuel, Settings, Globe } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-asphalt overflow-x-hidden font-['Rajdhani']">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Midnight Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-asphalt via-carbon to-midnight-purple opacity-80" />
        
        {/* Animated Background Details */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-violet rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turbo-orange rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase text-white mb-4">
              Master Your <span className="text-neon-violet drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">Machine</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary font-medium tracking-widest uppercase mb-12 max-w-2xl mx-auto">
              High-performance fuel tracking for those who demand precision.
            </p>
            
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-neon-violet text-white px-10 py-4 rounded-sm font-black text-2xl uppercase tracking-tighter shadow-neon animate-pulse hover:animate-none transition-all duration-300"
              >
                Launch App
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30">
          <span className="text-xs font-bold uppercase tracking-widest mb-2">Scroll to explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Fuel Precision",
              desc: "Track every drop with military-grade accuracy. Real-time consumption analytics at your fingertips.",
              icon: Fuel
            },
            {
              title: "Predictive Health",
              desc: "AI-driven maintenance alerts before parts fail. Stay ahead of the curve.",
              icon: Settings
            },
            {
              title: "Global Currency",
              desc: "Seamless exchange for international rallies. Track expenses in any major currency.",
              icon: Globe
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-carbon border border-industrial-border p-8 rounded-sm hover:border-neon-violet transition-colors duration-500 group"
            >
              <feature.icon className="w-10 h-10 mb-4 text-neon-violet group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
              <h3 className="text-2xl font-black uppercase italic text-text-primary mb-3">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-industrial-border text-center opacity-50">
        <p className="text-xs uppercase tracking-[0.5em] font-bold">Luxe Fuel &copy; 2026 // Built for the track</p>
      </footer>
    </div>
  );
};

export default Landing;
