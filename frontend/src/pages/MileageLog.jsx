import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useCars } from '../hooks/useCars';
import { useFuelRecords } from '../hooks/useFuelRecords';
import Layout from '../components/Layout';

function MileageLog() {
  const { user } = useAuthStore();
  const isOrgUser = useAuthStore((state) => state.isOrgUser);
  const { convert, formatPrice } = useCurrencyStore();
  const { cars, orgCars, personalCars, selectedCar, setSelectedCar } = useCars(user);
  const { records, updateRecord, deleteRecord } = useFuelRecords(selectedCar?.id);

  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({ fuelCost: '', pricePerLitre: '', odometer: '', isFullTank: true, date: '' });

  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditFormData({
      fuelCost: convert(record.fuelCost)?.toFixed(2) || record.fuelCost,
      pricePerLitre: convert(record.pricePerLitre)?.toFixed(2) || record.pricePerLitre,
      odometer: record.odometer,
      isFullTank: record.isFullTank,
      date: new Date(record.date).toISOString().slice(0, 16)
    });
    document.getElementById('edit_modal').showModal();
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!editingRecord || !selectedCar) return;
    
    const rate = convert(1);
    const toTHB = (val) => rate ? val / rate : val;

    const payload = {
      fuelCost: toTHB(parseFloat(editFormData.fuelCost)),
      pricePerLitre: toTHB(parseFloat(editFormData.pricePerLitre)),
      odometer: parseFloat(editFormData.odometer),
      isFullTank: editFormData.isFullTank,
      date: editFormData.date
    };

    await updateRecord(selectedCar.id, editingRecord.id, payload);
    document.getElementById('edit_modal').close();
    setEditingRecord(null);
  };

  const handleDelete = async (recordId) => {
    if (selectedCar) {
      await deleteRecord(selectedCar.id, recordId);
    }
  };

  // Org users can only edit records they submitted, and cannot delete
  const canEditRecord = (record) => {
    if (isOrgUser()) {
      return record.submittedById === user.id;
    }
    return true;
  };

  const canDeleteRecord = () => {
    return !isOrgUser();
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Car Selector */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="font-bold text-lg whitespace-nowrap text-secondary">Select Car</h2>
              <select
                className="select select-bordered w-full sm:flex-1"
                value={selectedCar?.id || ''}
                onChange={(e) => setSelectedCar(cars.find(c => c.id === parseInt(e.target.value)))}
              >
                <option disabled value="">Select a car</option>
                {orgCars.length > 0 && (
                  <optgroup label="Organization Fleet">
                    {orgCars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.brand}) {c.licensePlate ? `• ${c.licensePlate}` : ''}</option>)}
                  </optgroup>
                )}
                {personalCars.length > 0 && (
                  <optgroup label={orgCars.length > 0 ? "Personal Cars" : "My Cars"}>
                    {personalCars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.brand})</option>)}
                  </optgroup>
                )}
                {orgCars.length === 0 && personalCars.length === 0 && (
                  cars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.brand})</option>)
                )}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Mileage Log */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl border-b border-base-300 pb-2">
              📋 Mileage Log {selectedCar && <span className="text-base opacity-50 font-normal">— {selectedCar.name}</span>}
            </h2>
            <div className="flex flex-col gap-4 mt-2">
              {!selectedCar ? (
                <div className="opacity-50 text-center py-8">Please select a car to view its mileage log.</div>
              ) : records.length === 0 ? (
                <div className="opacity-50 text-center py-8">No logs generated yet.</div>
              ) : (
                [...records].reverse().map(record => (
                  <div key={record.id} className="p-4 bg-base-200 rounded-xl relative group">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold opacity-80">{record.displayDate}</div>
                        <div className="text-xl font-bold mt-1 text-primary">{formatPrice(record.fuelCost)}</div>
                        <div className="opacity-70 mt-1 flex gap-2 items-center">
                          <span>💧 {record.litresRefueled.toFixed(2)} L</span>
                          <span>→</span>
                          <span>{formatPrice(record.pricePerLitre)} / L</span>
                        </div>
                        <div className="mt-2 text-secondary font-medium">
                          {record.isFullTank && record.consumptionRate !== null
                            ? `📈 ${record.consumptionRate.toFixed(2)} km/L`
                            : `〰️ Partially Filled`}
                        </div>
                        {/* Submitter info */}
                        {record.submittedBy && (
                          <div className="mt-1 text-xs opacity-40">
                            Submitted by {record.submittedBy.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{record.odometer} km</div>
                        {record.distanceTraveled > 0 && <div className="text-sm opacity-60">+{record.distanceTraveled} km</div>}

                        <div className="flex gap-2 justify-end mt-4">
                          {canEditRecord(record) && (
                            <button onClick={() => openEditModal(record)} className="btn btn-xs btn-outline btn-info">Edit</button>
                          )}
                          {canDeleteRecord() && (
                            <button onClick={() => handleDelete(record.id)} className="btn btn-xs btn-outline btn-error">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl text-secondary">Edit Fuel Record</h3>
          {editingRecord && (
            <form onSubmit={handleUpdateRecord} className="flex flex-col gap-3 mt-4">
              <label className="text-sm opacity-70">Price of Gas</label>
              <input required type="number" step="0.01" className="input input-sm input-bordered" value={editFormData.fuelCost} onChange={e => setEditFormData({ ...editFormData, fuelCost: e.target.value })} />

              <label className="text-sm opacity-70">Gas Price per Litre</label>
              <input required type="number" step="0.01" className="input input-sm input-bordered" value={editFormData.pricePerLitre} onChange={e => setEditFormData({ ...editFormData, pricePerLitre: e.target.value })} />

              <label className="text-sm opacity-70">Odometer (km)</label>
              <input required type="number" step="0.1" className="input input-sm input-bordered" value={editFormData.odometer} onChange={e => setEditFormData({ ...editFormData, odometer: e.target.value })} />

              <label className="text-sm opacity-70 mt-2">Date & Time</label>
              <input required type="datetime-local" className="input input-sm input-bordered" value={editFormData.date} onChange={e => setEditFormData({ ...editFormData, date: e.target.value })} />

              <label className="label cursor-pointer justify-start gap-4 mt-2">
                <span className="label-text opacity-80 font-medium">Full tank</span>
                <input type="checkbox" className="toggle toggle-accent" checked={editFormData.isFullTank} onChange={e => setEditFormData({ ...editFormData, isFullTank: e.target.checked })} />
              </label>

              <div className="modal-action mt-4">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={() => document.getElementById('edit_modal').close()} className="btn">Cancel</button>
              </div>
            </form>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </Layout>
  );
}

export default MileageLog;
