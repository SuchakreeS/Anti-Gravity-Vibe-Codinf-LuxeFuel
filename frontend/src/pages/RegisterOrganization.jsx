import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCyberToast } from '../components/CyberToast';
import command_center from '../assets/command_center.webp';

const registerOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

function RegisterOrganization() {
  const navigate = useNavigate();
  const cyberToast = useCyberToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerOrgSchema)
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register-org', data);
      cyberToast.success('Organization Created // Admin Credentials Initialized');
      navigate('/login');
    } catch (err) {
      cyberToast.error(err.response?.data?.message || 'Registration failure');
    }
  };

  return (
    <div className="min-h-screen flex bg-asphalt font-['Rajdhani']">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex flex-1 relative bg-carbon overflow-hidden">
        {/* Tachometer Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${command_center})`, filter: 'brightness(0.4)' }}
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
              Fleet Management // Professional Tier
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-6 text-right lg:text-left">
            <h2 className="text-4xl font-black italic uppercase text-white mb-2 tracking-tighter">Organization Setup</h2>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-sm">Register your fleet command center</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Organization Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Fleet / Organization Name</label>
              <input
                {...register('organizationName')}
                type="text"
                placeholder="ACME CORP FLEET"
                className="w-full bg-carbon border border-industrial-border rounded-sm px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 uppercase font-bold"
              />
              {errors.organizationName && <span className="text-turbo-orange text-[10px] font-bold uppercase tracking-widest ml-1">{errors.organizationName.message}</span>}
            </div>

            <div className="divider text-text-secondary/20 text-[10px] font-black tracking-[0.5em] my-1">ADMINISTRATOR</div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Admin Name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="JOHN DOE"
                className="w-full bg-carbon border border-industrial-border rounded-sm px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 uppercase font-bold"
              />
              {errors.name && <span className="text-turbo-orange text-[10px] font-bold uppercase tracking-widest ml-1">{errors.name.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Admin Access Token (Email)</label>
              <input
                {...register('email')}
                type="email"
                placeholder="ADMIN@ACME.COM"
                className="w-full bg-carbon border border-industrial-border rounded-sm px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 uppercase font-bold"
              />
              {errors.email && <span className="text-turbo-orange text-[10px] font-bold uppercase tracking-widest ml-1">{errors.email.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Admin Security Key (Password)</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-carbon border border-industrial-border rounded-sm px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-neon-violet focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 font-bold"
              />
              {errors.password && <span className="text-turbo-orange text-[10px] font-bold uppercase tracking-widest ml-1">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              className="w-full bg-turbo-orange hover:bg-white hover:text-asphalt text-white py-4 rounded-sm font-black text-xl uppercase tracking-tighter shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 mt-4"
            >
              Deploy Fleet Command //
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-industrial-border text-center flex flex-col gap-2">
            <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">
              Back to Individual?{' '}
              <Link to="/register" className="text-neon-violet hover:text-white transition-colors font-black italic">
                Personal Registration
              </Link>
            </p>
            <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">
              Existing Admin?{' '}
              <Link to="/login" className="text-neon-violet hover:text-white transition-colors font-black italic">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RegisterOrganization;
