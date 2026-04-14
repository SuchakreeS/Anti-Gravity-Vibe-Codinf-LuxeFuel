import React from 'react';
import { motion } from 'framer-motion';

function MyCars({ 
  isOrgUser, isAdmin, isOrgMember, 
  displayCars, canAddCar,
  addingCar, setAddingCar,
  useOwnCar, setUseOwnCar,
  handleAddCar, newCarForm, setNewCarForm,
  isManualEntry, setIsManualEntry,
  fetchModels, makes, models, loadingModels,
  editingCar, openEditCar, handleUpdateCar, handleDeleteCar,
  carForm, setCarForm 
}) {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center border-b border-base-300 pb-3">
          <h2 className="card-title text-xl text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            {isOrgUser() ? 'My Personal Cars' : 'My Cars'} ({displayCars.length})
          </h2>
          {canAddCar && (
            <button className="btn btn-accent btn-sm gap-1" onClick={() => setAddingCar(!addingCar)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Car
            </button>
          )}
        </div>

        {addingCar && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-base-200 rounded-xl">
            <h3 className="font-bold mb-3 text-accent">
              {isOrgUser() ? 'New Personal Car' : isAdmin() ? 'New Car' : 'New Car'}
            </h3>

            {/* Admin toggle for org/personal */}
            {isAdmin() && (
              <div className="form-control mb-3 p-3 bg-base-300 rounded-lg">
                <label className="label cursor-pointer justify-start gap-3 py-0">
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary toggle-sm" 
                    checked={useOwnCar}
                    onChange={e => setUseOwnCar(e.target.checked)} 
                  />
                  <div>
                    <span className="label-text font-medium text-sm">Personal car</span>
                    <p className="text-xs opacity-50">
                      {useOwnCar ? 'This will be your personal car' : 'This car will be added to the organization fleet'}
                    </p>
                  </div>
                </label>
              </div>
            )}

            <form onSubmit={handleAddCar} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-medium opacity-70">Car Name</span></label>
                  <input required placeholder="e.g. My Daily" className="input input-sm input-bordered" value={newCarForm.name} onChange={e => setNewCarForm({ ...newCarForm, name: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-medium opacity-70">License Plate {isOrgMember() ? '*' : '(Optional)'}</span></label>
                  <input 
                    placeholder="e.g. กข-1234" 
                    className="input input-sm input-bordered" 
                    required={isOrgMember()}
                    value={newCarForm.licensePlate} 
                    onChange={e => setNewCarForm({ ...newCarForm, licensePlate: e.target.value })} 
                  />
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
                      className="select select-bordered select-sm w-full"
                      disabled={!newCarForm.brand || loadingModels}
                      value={newCarForm.model}
                      onChange={e => setNewCarForm({ ...newCarForm, model: e.target.value })}
                    >
                      <option value="">{loadingModels ? 'Loading...' : 'Select Model'}</option>
                      {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required placeholder="Brand (e.g. Toyota)" className="input input-sm input-bordered" value={newCarForm.brand} onChange={e => setNewCarForm({ ...newCarForm, brand: e.target.value })} />
                    <input required placeholder="Model (e.g. Corolla)" className="input input-sm input-bordered" value={newCarForm.model} onChange={e => setNewCarForm({ ...newCarForm, model: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text font-medium opacity-70">Other Specs (Optional)</span></label>
                <input placeholder="2024 Hybrid" className="input input-sm input-bordered" value={newCarForm.otherSpecs} onChange={e => setNewCarForm({ ...newCarForm, otherSpecs: e.target.value })} />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn btn-accent btn-sm">Save Car</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAddingCar(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          {displayCars.length === 0 && (
            <div className="text-center opacity-50 py-8">
              {isOrgUser() ? 'No personal cars yet. Add one above!' : 'No cars yet. Add your first car above!'}
            </div>
          )}
          {displayCars.map(car => (
            <div key={car.id} className="p-4 bg-base-200 rounded-xl">
              {editingCar?.id === car.id ? (
                <form onSubmit={handleUpdateCar} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required placeholder="Name" className="input input-sm input-bordered" value={carForm.name} onChange={e => setCarForm({ ...carForm, name: e.target.value })} />
                  <input required placeholder="Brand" className="input input-sm input-bordered" value={carForm.brand} onChange={e => setCarForm({ ...carForm, brand: e.target.value })} />
                  <input required placeholder="Model" className="input input-sm input-bordered" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} />
                  <input placeholder="License Plate" className="input input-sm input-bordered" value={carForm.licensePlate} onChange={e => setCarForm({ ...carForm, licensePlate: e.target.value })} />
                  <input placeholder="Other Specs" className="input input-sm input-bordered" value={carForm.otherSpecs} onChange={e => setCarForm({ ...carForm, otherSpecs: e.target.value })} />
                  <div className="md:col-span-2 flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm">Save</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingCar(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      {car.name}
                      {car.isPersonal && isOrgMember() && (
                        <span className="badge badge-xs badge-ghost">Personal</span>
                      )}
                    </div>
                    <div className="opacity-70">{car.brand} {car.model}</div>
                    <div className="flex gap-2 mt-1">
                      {car.licensePlate && <span className="badge badge-outline badge-sm">🔖 {car.licensePlate}</span>}
                      {car.otherSpecs && <span className="text-sm opacity-50">{car.otherSpecs}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-xs btn-outline btn-info" onClick={() => openEditCar(car)}>Edit</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDeleteCar(car.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default MyCars;
