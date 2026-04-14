import React from 'react';
import { motion } from 'framer-motion';

function FleetTab({
  orgCars,
  showCarForm, setShowCarForm,
  carForm, setCarForm,
  isManualEntry, setIsManualEntry,
  makes, models, loadingModels,
  fetchModels,
  handleAddCar
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center border-b border-base-300 pb-3">
          <h2 className="card-title text-xl text-accent">Organization Fleet</h2>
          <button 
            className="btn btn-accent btn-sm gap-1"
            onClick={() => setShowCarForm(!showCarForm)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Car
          </button>
        </div>

        {showCarForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-base-200 rounded-xl">
            <h3 className="font-bold mb-3 text-accent">New Organization Car</h3>
            <form onSubmit={handleAddCar} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1"><span className="label-text text-sm opacity-70">Car Name</span></label>
                  <input required placeholder="e.g. Company Van #1" className="input input-sm input-bordered" value={carForm.name} onChange={e => setCarForm({ ...carForm, name: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label py-1"><span className="label-text text-sm opacity-70">License Plate *</span></label>
                  <input required placeholder="e.g. กข-1234" className="input input-sm input-bordered" value={carForm.licensePlate} onChange={e => setCarForm({ ...carForm, licensePlate: e.target.value })} />
                </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select 
                      required 
                      className="select select-bordered select-sm w-full"
                      value={carForm.brand}
                      onChange={e => {
                        const val = e.target.value;
                        setCarForm({ ...carForm, brand: val, model: '' });
                        fetchModels(val);
                      }}
                    >
                      <option value="">Select Brand</option>
                      {makes.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>

                    <select 
                      required 
                      className="select select-bordered select-sm w-full"
                      disabled={!carForm.brand || loadingModels}
                      value={carForm.model}
                      onChange={e => setCarForm({ ...carForm, model: e.target.value })}
                    >
                      <option value="">{loadingModels ? 'Loading...' : 'Select Model'}</option>
                      {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required placeholder="Brand (e.g. Toyota)" className="input input-sm input-bordered" value={carForm.brand} onChange={e => setCarForm({ ...carForm, brand: e.target.value })} />
                    <input required placeholder="Model (e.g. Corolla)" className="input input-sm input-bordered" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm opacity-70">Other Specs (Optional)</span></label>
                <input placeholder="2024 Diesel" className="input input-sm input-bordered" value={carForm.otherSpecs} onChange={e => setCarForm({ ...carForm, otherSpecs: e.target.value })} />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn btn-accent btn-sm">Add Car</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCarForm(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          {orgCars.length === 0 ? (
            <div className="text-center opacity-50 py-8">No fleet cars yet. Add your first car above!</div>
          ) : (
            orgCars.map(car => (
              <div key={car.id} className="p-4 bg-base-200 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">{car.name}</div>
                  <div className="opacity-70">{car.brand} {car.model}</div>
                  <div className="flex gap-3 mt-1">
                    {car.licensePlate && (
                      <span className="badge badge-outline badge-sm">🔖 {car.licensePlate}</span>
                    )}
                    {car.otherSpecs && <span className="text-sm opacity-50">{car.otherSpecs}</span>}
                  </div>
                </div>
                <span className="badge badge-ghost">Org Fleet</span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default FleetTab;
