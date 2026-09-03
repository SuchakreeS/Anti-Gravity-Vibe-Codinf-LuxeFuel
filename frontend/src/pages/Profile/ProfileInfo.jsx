import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

function ProfileInfo({ handleUpdateProfile, profileForm, setProfileForm, badge, profile }) {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card bg-carbon border border-industrial-border shadow-2xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-black italic uppercase tracking-tighter text-text-primary border-b border-industrial-border pb-3 flex items-center gap-2">
          <User className="h-6 w-6 text-neon-violet" aria-hidden="true" />
          Profile Information
        </h2>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 mt-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-[10px] font-black uppercase tracking-widest text-text-secondary">Name</span></label>
            <input
              required
              type="text"
              className="w-full bg-asphalt border border-industrial-border rounded-sm p-3 text-text-primary focus:outline-none focus:border-neon-violet transition-all"
              value={profileForm.name}
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-[10px] font-black uppercase tracking-widest text-text-secondary">Email</span></label>
            <input
              required
              type="email"
              className="w-full bg-asphalt border border-industrial-border rounded-sm p-3 text-text-primary focus:outline-none focus:border-neon-violet transition-all"
              value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {badge.text && (
              <span className="px-2 py-1 bg-gauge-face border border-chrome/30 rounded-sm text-[9px] font-black uppercase tracking-widest text-chrome">
                {badge.text}
              </span>
            )}
            {profile?.plan && (
              <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border ${
                profile.plan === 'FREE'
                  ? 'border-industrial-border text-text-secondary'
                  : 'border-neon-violet text-neon-violet'
              }`}>
                {profile.plan} PLAN
              </span>
            )}
            {profile?.orgPlan && profile.orgPlan !== profile.plan && (
              <span className="px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border border-turbo-orange text-turbo-orange">
                ORG: {profile.orgPlan}
              </span>
            )}
            {profile?.organizationName && (
              <span className="text-xs text-text-secondary opacity-60">@ {profile.organizationName}</span>
            )}
          </div>
          {profile && (
            <div className="text-[10px] uppercase font-bold tracking-widest text-text-secondary opacity-50 mt-1">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          )}
          <button className="px-4 py-2 w-fit mt-2 rounded-sm text-xs font-black uppercase tracking-widest border-2 border-neon-violet text-neon-violet hover:bg-neon-violet hover:text-asphalt shadow-neon transition-all duration-300">
            Save Changes
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default ProfileInfo;
