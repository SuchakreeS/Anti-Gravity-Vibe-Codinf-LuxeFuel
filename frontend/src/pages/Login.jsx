import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

import { useCyberToast } from '../components/CyberToast';
import tachometer from '../assets/tachometer.webp';

function Login() {
  const cyberToast = useCyberToast();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', { email: data.email, password: data.password, rememberMe: true });
      login(res.data.user, true);
      cyberToast.success('Session Initialized');
      navigate('/dashboard');
    } catch (err) {
      cyberToast.error(err.response?.data?.message || 'Authorization failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-asphalt font-['Rajdhani']">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex flex-1 relative bg-carbon overflow-hidden">
        {/* Tachometer Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${tachometer})`, filter: 'brightness(0.4)' }}
        />
        
        {/* Carbon Fiber Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10 z-1"
          style={{
            backgroundColor: 'transparent',
            backgroundImage: `linear-gradient(45deg, #050508 25%, transparent 25%), linear-gradient(-45deg, #050508 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #050508 75%), linear-gradient(-45deg, transparent 75%, #050508 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px 10px, 10px 0'
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-8xl font-black italic tracking-tighter uppercase text-white mb-2">
              Luxe<span className="text-neon-violet drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Fuel</span>
            </h1>
            <div className="h-1 w-24 bg-neon-violet mx-auto mb-6 shadow-neon" />
            <p className="text-xl text-text-secondary uppercase tracking-[0.3em] font-bold">
              Precision Tracking // Pure Performance
            </p>
          </motion.div>
        </div>

        {/* Industrial detailing */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-asphalt to-transparent opacity-50" />
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black italic uppercase text-white mb-2 tracking-tighter">Welcome Back</h2>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-sm">Secure authorization required</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Access Token (Email)</label>
              <input
                {...register('email')}
                type="email"
                placeholder="OPERATOR@LUXEFUEL.COM"
                className="w-full bg-carbon border border-industrial-border rounded-sm px-4 py-3 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-violet focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 uppercase font-bold"
              />
              {errors.email && <span className="text-turbo-orange text-[10px] font-bold uppercase tracking-widest ml-1">{errors.email.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Security Key (Password)</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-carbon border border-industrial-border rounded-sm px-4 py-3 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-violet focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 font-bold"
              />
              {errors.password && <span className="text-turbo-orange text-[10px] font-bold uppercase tracking-widest ml-1">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              className="w-full bg-neon-violet hover:bg-white hover:text-asphalt text-white py-4 rounded-sm font-black text-xl uppercase tracking-tighter shadow-neon transition-all duration-300 mt-4"
            >
              Initialize Session
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-industrial-border text-center">
            <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">
              New Operator?{' '}
              <Link to="/register" className="text-neon-violet hover:text-white transition-colors font-black italic">
                Request Registration //
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
