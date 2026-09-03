import React from 'react';
import { motion } from 'framer-motion';
import { Car, Plus, Tag, Droplet } from 'lucide-react';
import CyberUploader from '../../components/CyberUploader';
import { uploadCarPhoto } from '../../utils/upload';
import Car_default from '../../assets/car-svgrepo-com.svg'

const inputClass = "w-full bg-asphalt border border-industrial-border rounded-sm px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-neon-violet transition-all";
const labelClass = "label py-1"
const labelTextClass = "label-text text-[10px] font-black uppercase tracking-widest text-text-secondary";

function MyCars({
  isOrgUser, isAdmin, isOrgMember,
  displayCars, canAddCar,
  addingCar, setAddingCar,
  useOwnCar, setUseOwnCar,
  handleAddCar, newCarForm, setNewCarForm,
  isManualEntry, setIsManualEntry,
  fetchModels, makes, models, loadingModels,
  editingCar, openEditCar, handleUpdateCar, handleDeleteCar,
  carForm, setCarForm, setEditingCar
}) {
  const handleImageUpload = async (carId, file) => {
    const url = await uploadCarPhoto(carId, file);
    setCarForm({ ...carForm, photoUrl: url });
  };

  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card bg-carbon border border-industrial-border shadow-2xl">
      <div className="card-body">
        <div className="flex justify-between items-center border-b border-industrial-border pb-3">
          <h2 className="card-title text-xl font-black italic uppercase tracking-tighter text-text-primary flex items-center gap-2">
            <Car className="h-6 w-6 text-turbo-orange" aria-hidden="true" />
            {isOrgUser() ? 'My Personal Cars' : 'My Cars'} ({displayCars.length})
          </h2>
          {canAddCar && (
            <button
              className="px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border-2 border-turbo-orange text-turbo-orange hover:bg-turbo-orange hover:text-asphalt transition-all duration-300 inline-flex items-center gap-1"
              onClick={() => setAddingCar(!addingCar)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Car
            </button>
          )}
        </div>

        {addingCar && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-asphalt border border-industrial-border rounded-sm">
            <h3 className="font-black uppercase italic tracking-tighter mb-3 text-turbo-orange">
              {isOrgUser() ? 'New Personal Car' : isAdmin() ? 'New Car' : 'New Car'}
            </h3>

            {/* Admin toggle for org/personal */}
            {isAdmin() && (
              <div className="form-control mb-3 p-3 bg-carbon border border-industrial-border rounded-sm">
                <label className="label cursor-pointer justify-start gap-3 py-0">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={useOwnCar}
                    onChange={e => setUseOwnCar(e.target.checked)}
                  />
                  <div>
                    <span className="label-text text-sm font-bold text-text-primary">Personal car</span>
                    <p className="text-xs text-text-secondary opacity-70">
                      {useOwnCar ? 'This will be your personal car' : 'This car will be added to the organization fleet'}
                    </p>
                  </div>
                </label>
              </div>
            )}

            <form onSubmit={handleAddCar} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className={labelClass}><span className={labelTextClass}>Car Name</span></label>
                  <input required placeholder="e.g. My Daily" className={inputClass} value={newCarForm.name} onChange={e => setNewCarForm({ ...newCarForm, name: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className={labelClass}><span className={labelTextClass}>License Plate {isOrgMember() ? '*' : '(Optional)'}</span></label>
                  <input
                    placeholder="e.g. กข-1234"
                    className={inputClass}
                    required={isOrgMember()}
                    value={newCarForm.licensePlate}
                    onChange={e => setNewCarForm({ ...newCarForm, licensePlate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className={labelClass}><span className={labelTextClass}>Gas Tank Size (L)</span></label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    className={inputClass}
                    value={newCarForm.tankSize}
                    onChange={e => setNewCarForm({ ...newCarForm, tankSize: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-control">
                  <label className={labelClass}><span className={labelTextClass}>Other Specs (Optional)</span></label>
                  <input placeholder="2024 Hybrid" className={inputClass} value={newCarForm.otherSpecs} onChange={e => setNewCarForm({ ...newCarForm, otherSpecs: e.target.value })} />
                </div>
              </div>

              <div className="form-control">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Brand & Model</span>
                  <label className="label cursor-pointer p-0 gap-2">
                    <span className="label-text text-[10px] uppercase font-bold text-text-secondary opacity-70">Manual entry</span>
                    <input type="checkbox" className="checkbox checkbox-xs" checked={isManualEntry} onChange={e => setIsManualEntry(e.target.checked)} />
                  </label>
                </div>

                {!isManualEntry ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      required
                      className={inputClass}
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
                      className={inputClass}
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
                    <input required placeholder="Brand (e.g. Toyota)" className={inputClass} value={newCarForm.brand} onChange={e => setNewCarForm({ ...newCarForm, brand: e.target.value })} />
                    <input required placeholder="Model (e.g. Corolla)" className={inputClass} value={newCarForm.model} onChange={e => setNewCarForm({ ...newCarForm, model: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border-2 border-turbo-orange text-turbo-orange hover:bg-turbo-orange hover:text-asphalt transition-all duration-300">Save Car</button>
                <button type="button" className="px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border border-industrial-border text-text-secondary hover:text-text-primary hover:border-chrome/50 transition-all duration-300" onClick={() => setAddingCar(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          {displayCars.length === 0 && (
            <div className="text-center text-text-secondary opacity-60 py-8 text-xs uppercase tracking-widest font-bold">
              {isOrgUser() ? 'No personal cars yet. Add one above!' : 'No cars yet. Add your first car above!'}
            </div>
          )}
          {displayCars.map(car => (
            <div key={car.id} className="p-4 bg-asphalt border border-industrial-border rounded-sm">
              {editingCar?.id === car.id ? (
                <form onSubmit={handleUpdateCar} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className={labelClass}><span className={labelTextClass}>Name</span></label>
                    <input required placeholder="Name" className={inputClass} value={carForm.name} onChange={e => setCarForm({ ...carForm, name: e.target.value })} />
                  </div>
                  <div className="form-control">
                    <label className={labelClass}><span className={labelTextClass}>Brand</span></label>
                    <input required placeholder="Brand" className={inputClass} value={carForm.brand} onChange={e => setCarForm({ ...carForm, brand: e.target.value })} />
                  </div>
                  <div className="form-control">
                    <label className={labelClass}><span className={labelTextClass}>Model</span></label>
                    <input required placeholder="Model" className={inputClass} value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} />
                  </div>
                  <div className="form-control">
                    <label className={labelClass}><span className={labelTextClass}>License Plate</span></label>
                    <input placeholder="License Plate" className={inputClass} value={carForm.licensePlate} onChange={e => setCarForm({ ...carForm, licensePlate: e.target.value })} />
                  </div>
                  <div className="form-control">
                    <label className={labelClass}><span className={labelTextClass}>Tank Size (L)</span></label>
                    <input type="number" placeholder="Tank Size" className={inputClass} value={carForm.tankSize} onChange={e => setCarForm({ ...carForm, tankSize: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="form-control">
                    <label className={labelClass}><span className={labelTextClass}>Other Specs</span></label>
                    <input placeholder="Other Specs" className={inputClass} value={carForm.otherSpecs} onChange={e => setCarForm({ ...carForm, otherSpecs: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 flex flex-col items-center gap-3 mt-2">
                    <CyberUploader onUpload={(file) => handleImageUpload(car.id, file)} currentUrl={carForm.photoUrl} />
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border-2 border-neon-violet text-neon-violet hover:bg-neon-violet hover:text-asphalt transition-all duration-300">Save</button>
                      <button type="button" className="px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border border-industrial-border text-text-secondary hover:text-text-primary hover:border-chrome/50 transition-all duration-300" onClick={() => setEditingCar(null)}>Cancel</button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src={car.photoUrl || Car_default}
                      alt={car.name}
                      className="w-16 h-16 rounded-md object-cover border border-industrial-border"
                    />
                    <div>
                      <div className="font-black italic uppercase text-lg text-text-primary flex items-center gap-2">
                        {car.name}
                        {car.isPersonal && isOrgMember() && (
                          <span className="px-1.5 py-0.5 bg-gauge-face border border-chrome/20 rounded-sm text-[9px] font-black uppercase tracking-widest text-chrome">Personal</span>
                        )}
                      </div>
                      <div className="text-text-secondary opacity-70 text-sm">{car.brand} {car.model}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {car.licensePlate && <span className="px-2 py-0.5 bg-gauge-face border border-chrome/20 rounded-sm text-[10px] font-bold text-chrome inline-flex items-center gap-1"><Tag className="w-3 h-3" aria-hidden="true" /> {car.licensePlate}</span>}
                        {car.tankSize > 0 && <span className="px-2 py-0.5 bg-gauge-face border border-chrome/20 rounded-sm text-[10px] font-bold text-chrome inline-flex items-center gap-1"><Droplet className="w-3 h-3" aria-hidden="true" /> {car.tankSize}L</span>}
                        {car.otherSpecs && <span className="text-xs text-text-secondary opacity-50">{car.otherSpecs}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border border-neon-violet text-neon-violet hover:bg-neon-violet hover:text-asphalt transition-all duration-300" onClick={() => openEditCar(car)}>Edit</button>
                    <button className="px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300" onClick={() => handleDeleteCar(car.id)}>Delete</button>
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
