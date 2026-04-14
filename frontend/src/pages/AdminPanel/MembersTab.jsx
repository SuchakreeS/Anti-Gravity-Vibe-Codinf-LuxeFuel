import React from 'react';
import { motion } from 'framer-motion';

function MembersTab({ 
  members, 
  showMemberForm, setShowMemberForm, 
  memberForm, setMemberForm, 
  handleAddMember, handleRemoveMember 
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center border-b border-base-300 pb-3">
          <h2 className="card-title text-xl text-primary">Organization Members</h2>
          <button 
            className="btn btn-primary btn-sm gap-1"
            onClick={() => setShowMemberForm(!showMemberForm)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Member
          </button>
        </div>

        {showMemberForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-base-200 rounded-xl">
            <h3 className="font-bold mb-3 text-primary">New Member</h3>
            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm opacity-70">Name</span></label>
                <input required placeholder="John Doe" className="input input-sm input-bordered" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm opacity-70">Email</span></label>
                <input required type="email" placeholder="john@acme.com" className="input input-sm input-bordered" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm opacity-70">Password</span></label>
                <input required type="password" minLength={6} placeholder="••••••" className="input input-sm input-bordered" value={memberForm.password} onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} />
              </div>
              <div className="md:col-span-3 flex gap-2 mt-2">
                <button type="submit" className="btn btn-primary btn-sm">Create Account</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowMemberForm(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          {members.length === 0 ? (
            <div className="text-center opacity-50 py-8">No members yet. Add your first member above!</div>
          ) : (
            members.map(member => (
              <div key={member.id} className="p-4 bg-base-200 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`avatar placeholder`}>
                    <div className={`w-10 rounded-full ${member.role === 'admin' ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                      <span className="text-sm font-bold">{member.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {member.name}
                      <span className={`badge badge-xs ${member.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="text-sm opacity-60">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-40">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                  {member.role !== 'admin' && (
                    <button 
                      className="btn btn-xs btn-outline btn-error"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MembersTab;
