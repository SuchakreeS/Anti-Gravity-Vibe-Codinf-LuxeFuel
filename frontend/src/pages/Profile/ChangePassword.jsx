import React from 'react';
import { motion } from 'framer-motion';

function ChangePassword({ handleChangePassword, passwordForm, setPasswordForm }) {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl text-secondary border-b border-base-300 pb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Current Password</span></label>
            <input required type="password" className="input input-bordered" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">New Password</span></label>
            <input required type="password" minLength={6} className="input input-bordered" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Confirm New Password</span></label>
            <input required type="password" minLength={6} className="input input-bordered" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
          </div>
          <button className="btn btn-secondary btn-sm w-fit mt-2">Update Password</button>
        </form>
      </div>
    </motion.div>
  );
}

export default ChangePassword;
