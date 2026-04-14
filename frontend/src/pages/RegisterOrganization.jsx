import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const registerOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

function RegisterOrganization() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerOrgSchema)
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register-org', data);
      Swal.fire({
        icon: 'success',
        title: 'Organization Created!',
        text: 'Your organization has been registered. Please log in.',
      });
      navigate('/login');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f0f0f] overflow-hidden">
      {/* Left Content Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 z-10 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-6xl font-black tracking-tight text-white mb-2">
              Luxe<span className="text-primary">Fuel</span>
            </h1>
            <p className="text-neutral-content/70 text-lg font-light">
              Manage your fleet. Track with precision.
            </p>
          </div>

          <div className="card w-full shadow-2xl bg-base-100/10 backdrop-blur-xl border border-white/10">
            <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-2xl font-bold mb-2">Register Organization</h2>
              <p className="text-sm opacity-50 mb-4">Create your organization and become its admin.</p>

              {/* Organization Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium opacity-70">
                    <span className="inline-flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Organization Name
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  className="input input-bordered focus:input-primary bg-white/5 border-white/10 transition-all duration-300"
                  {...register('organizationName')}
                />
                {errors.organizationName && (
                  <span className="text-error text-xs mt-1">{errors.organizationName.message}</span>
                )}
              </div>

              <div className="divider text-xs opacity-20 my-1">ADMIN ACCOUNT</div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium opacity-70">Your Name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered focus:input-primary bg-white/5 border-white/10 transition-all duration-300"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="text-error text-xs mt-1">{errors.name.message}</span>
                )}
              </div>
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text font-medium opacity-70">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="admin@acme.com"
                  className="input input-bordered focus:input-primary bg-white/5 border-white/10 transition-all duration-300"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-error text-xs mt-1">{errors.email.message}</span>
                )}
              </div>
              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text font-medium opacity-70">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered focus:input-primary bg-white/5 border-white/10 transition-all duration-300"
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-error text-xs mt-1">{errors.password.message}</span>
                )}
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary btn-block text-lg shadow-lg hover:shadow-primary/20 transition-all duration-500">
                  Create Organization
                </button>
              </div>
              <div className="divider text-xs opacity-30 uppercase tracking-widest">OR</div>
              <p className="text-center text-sm opacity-70">
                Register as individual?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                  Personal Account
                </Link>
              </p>
              <p className="text-center text-sm opacity-70 mt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline transition-all">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Right Video Side (Desktop Only) */}
      <div className="hidden lg:flex flex-1 relative bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover grayscale-[0.2] brightness-[0.7]"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-tachometer-of-a-car-speeding-up-4403-large.mp4"
            type="video/mp4"
          />
        </video>
        <div 
          className="absolute inset-0 z-20"
          style={{ 
            background: 'linear-gradient(to right, rgba(15, 15, 15, 0) 0%, rgba(15, 15, 15, 1) 100%)' 
          }}
        ></div>
        <div 
          className="absolute inset-0 z-10"
          style={{ 
            background: 'linear-gradient(to left, rgba(15, 15, 15, 1) 0%, rgba(15, 15, 15, 0.4) 100%)' 
          }}
        ></div>
      </div>
    </div>
  );
}
export default RegisterOrganization;
