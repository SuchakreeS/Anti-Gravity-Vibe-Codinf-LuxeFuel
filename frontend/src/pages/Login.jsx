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
  rememberMe: z.boolean().default(false)
});

function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', { email: data.email, password: data.password });
      login(res.data.user, res.data.token, data.rememberMe);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
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
              Track consumption & expenses. Elevate your driving experience.
            </p>
          </div>

          <div className="card w-full shadow-2xl bg-base-100/10 backdrop-blur-xl border border-white/10">
            <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium opacity-70">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
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
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3 mt-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm border-white/20"
                    {...register('rememberMe')}
                  />
                  <span className="label-text text-sm opacity-70">Keep me signed in</span>
                </label>
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary btn-block text-lg shadow-lg hover:shadow-primary/20 transition-all duration-500">
                  Sign In
                </button>
              </div>
              <div className="divider text-xs opacity-30 uppercase tracking-widest">OR</div>
              <p className="text-center text-sm opacity-70">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                  Register Now
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
        {/* Gradient Overlay for Fade and Luxury feel */}
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
export default Login;
