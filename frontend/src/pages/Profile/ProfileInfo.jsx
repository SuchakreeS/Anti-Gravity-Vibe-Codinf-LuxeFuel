import React from 'react';
import { motion } from 'framer-motion';

function ProfileInfo({ handleUpdateProfile, profileForm, setProfileForm, badge, profile }) {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary border-b border-base-300 pb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Profile Information
        </h2>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 mt-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Name</span></label>
            <input required type="text" className="input input-bordered" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Email</span></label>
            <input required type="email" className="input input-bordered" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${badge.class}`}>{badge.text}</span>
            {profile?.organization && (
              <span className="text-sm opacity-50">@ {profile.organization.name}</span>
            )}
          </div>
          {profile && (
            <div className="text-sm opacity-50 mt-1">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          )}
          <button className="btn btn-primary btn-sm w-fit mt-2">Save Changes</button>
        </form>
      </div>
    </motion.div>
  );
}

export default ProfileInfo;
