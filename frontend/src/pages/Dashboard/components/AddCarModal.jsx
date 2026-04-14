import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function AddCarModal({ onAddCar, makes, models, fetchModels, loadingMakes, loadingModels, userRole = 'individual' }) {
  const [newCarForm, setNewCarForm] = useState({ name: '', brand: '', model: '', licensePlate: '', otherSpecs: '' });
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [useOwnCar, setUseOwnCar] = useState(userRole === 'user'); // org users default to own car

  const handleSubmit = (e) => {
    e.preventDefault();
    const carData = { ...newCarForm };
    
    // For org users choosing "use own car", mark as personal
    if (userRole === 'user') {
      carData.isPersonal = true;
    } else if (userRole === 'admin') {
      carData.isPersonal = useOwnCar;
    }
    
    onAddCar(carData);
  };

  const isOrgMember = userRole === 'admin' || userRole === 'user';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card bg-base-100 shadow-2xl max-w-md w-full border border-primary/20"
      >
        <div className="card-body">
          <h2 className="card-title text-2xl text-primary mb-2">Welcome to LuxeFuel!</h2>
          <p className="text-base-content/70 mb-4">To get started with tracking your fuel consumption, please add your first car details below.</p>

          {/* Use own car toggle for org users */}
          {userRole === 'user' && (
            <div className="alert alert-info mb-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm">You're adding a personal car. Your organization admin manages fleet cars.</span>
            </div>
          )}

          {userRole === 'admin' && (
            <div className="form-control mb-3 p-3 bg-base-200 rounded-lg">
              <label className="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary toggle-sm" 
                  checked={useOwnCar}
                  onChange={e => setUseOwnCar(e.target.checked)} 
                />
                <div>
                  <span className="label-text font-medium">Use my own car</span>
                  <p className="text-xs opacity-50 mt-0.5">
                    {useOwnCar ? 'This will be your personal car' : 'This car will be added to the organization fleet'}
                  </p>
                </div>
              </label>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-medium opacity-70">Car Name</span></label>
              <input required placeholder="e.g. My Daily Driver" className="input input-bordered" value={newCarForm.name} onChange={e => setNewCarForm({ ...newCarForm, name: e.target.value })} />
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-medium opacity-70">License Plate</span></label>
              <input 
                placeholder="e.g. กข-1234" 
                className="input input-bordered" 
                required={isOrgMember}
                value={newCarForm.licensePlate} 
                onChange={e => setNewCarForm({ ...newCarForm, licensePlate: e.target.value })} 
              />
              {!isOrgMember && <span className="text-xs opacity-40 mt-1">Optional for individual accounts</span>}
            </div>

            <div className="form-control">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium opacity-70">Brand & Model</span>
                <label className="label cursor-pointer p-0 gap-2">
                  <span className="label-text text-xs opacity-50">Manual entry</span> 
                  <input type="checkbox" className="checkbox checkbox-xs" checked={isManualEntry} onChange={e => setIsManualEntry(e.target.checked)} />
                </label>
              </div>

              {!isManualEntry ? (
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    required 
                    className={`select select-bordered w-full ${loadingMakes ? 'loading' : ''}`}
                    value={newCarForm.brand}
                    onChange={e => {
                      const val = e.target.value;
                      setNewCarForm({ ...newCarForm, brand: val, model: '' });
                      fetchModels(val);
                    }}
                  >
                    <option value="">Select Brand</option>
                    {makes.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>

                  <select 
                    required 
                    className={`select select-bordered w-full ${loadingModels ? 'loading' : ''}`}
                    disabled={!newCarForm.brand || loadingModels}
                    value={newCarForm.model}
                    onChange={e => setNewCarForm({ ...newCarForm, model: e.target.value })}
                  >
                    <option value="">{loadingModels ? 'Loading...' : 'Select Model'}</option>
                    {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Brand (e.g. Toyota)" className="input input-bordered" value={newCarForm.brand} onChange={e => setNewCarForm({ ...newCarForm, brand: e.target.value })} />
                  <input required placeholder="Model (e.g. Corolla)" className="input input-bordered" value={newCarForm.model} onChange={e => setNewCarForm({ ...newCarForm, model: e.target.value })} />
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-medium opacity-70">Other Specs (Optional)</span></label>
              <input placeholder="2024 Hybrid" className="input input-bordered" value={newCarForm.otherSpecs} onChange={e => setNewCarForm({ ...newCarForm, otherSpecs: e.target.value })} />
            </div>

            <button className="btn btn-primary mt-4 shadow-lg">🚀 Get Started</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AddCarModal;
