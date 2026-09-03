import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

function ChangePassword({ handleChangePassword, passwordForm, setPasswordForm }) {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card bg-carbon border border-industrial-border shadow-2xl">
      <div className="card-body">
        <h2 className="card-title text-xl font-black italic uppercase tracking-tighter text-text-primary border-b border-industrial-border pb-3 flex items-center gap-2">
          <Lock className="h-5 w-5 text-turbo-orange" aria-hidden="true" />
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-[10px] font-black uppercase tracking-widest text-text-secondary">Current Password</span></label>
            <input
              required
              type="password"
              className="w-full bg-asphalt border border-industrial-border rounded-sm p-3 text-text-primary focus:outline-none focus:border-turbo-orange transition-all"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-[10px] font-black uppercase tracking-widest text-text-secondary">New Password</span></label>
            <input
              required
              type="password"
              minLength={6}
              className="w-full bg-asphalt border border-industrial-border rounded-sm p-3 text-text-primary focus:outline-none focus:border-turbo-orange transition-all"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-[10px] font-black uppercase tracking-widest text-text-secondary">Confirm New Password</span></label>
            <input
              required
              type="password"
              minLength={6}
              className="w-full bg-asphalt border border-industrial-border rounded-sm p-3 text-text-primary focus:outline-none focus:border-turbo-orange transition-all"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          <button className="px-4 py-2 w-fit mt-2 rounded-sm text-xs font-black uppercase tracking-widest border-2 border-turbo-orange text-turbo-orange hover:bg-turbo-orange hover:text-asphalt transition-all duration-300">
            Update Password
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default ChangePassword;
