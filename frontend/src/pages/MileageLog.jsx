import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useVehicleStore } from '../store/useVehicleStore';
import { useFuelRecords } from '../hooks/useFuelRecords';
import { FileText, Lock, Zap, Droplet, TrendingUp, Minus } from 'lucide-react';
import Layout from '../components/Layout';
import { cyberToast } from '../components/CyberToast';
import EditFuelRecordModal from './MileageLog/components/EditFuelRecordModal';

function MileageLog() {
  const { user } = useAuthStore();
  const isOrgUser = useAuthStore((state) => state.isOrgUser);
  const canExportPDF = useAuthStore((state) => state.canExportPDF);
  const { convert, formatPrice } = useCurrencyStore();
  const { cars, selectedCar, setSelectedCar, fetchCars } = useVehicleStore();
  const safeCars = Array.isArray(cars) ? cars : [];
  const orgCars = safeCars.filter(c => !c.isPersonal);
  const personalCars = safeCars.filter(c => c.isPersonal);

  useEffect(() => {
    if (cars.length === 0 && user) {
      fetchCars();
    }
  }, [cars.length, user, fetchCars]);

  const { records, updateRecord, deleteRecord } = useFuelRecords(selectedCar?.id);

  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({ fuelCost: '', pricePerLitre: '', odometer: '', isFullTank: true, date: '' });

  const handleUpdateRecord = async (payloadData) => {
    if (!editingRecord || !selectedCar) return;
    
    const rate = convert(1);
    const toTHB = (val) => rate ? val / rate : val;

    const payload = {
      fuelCost: toTHB(payloadData.fuelCost),
      odometer: payloadData.odometer,
      isFullTank: payloadData.isFullTank,
      date: payloadData.date
    };
    
    if (payloadData.pricePerLitre !== undefined) payload.pricePerLitre = toTHB(payloadData.pricePerLitre);
    if (payloadData.pricePerKwh !== undefined) payload.pricePerKwh = toTHB(payloadData.pricePerKwh);

    await updateRecord(selectedCar.id, editingRecord.id, payload);
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
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card bg-carbon border border-industrial-border shadow-2xl mb-6">
          <div className="card-body py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-xs uppercase font-black tracking-widest text-emerald-500 whitespace-nowrap">Target Vehicle</h2>
              <select
                className="bg-asphalt border border-industrial-border rounded-sm px-4 py-3 text-white focus:outline-none focus:border-neon-violet transition-all duration-300 uppercase font-bold text-xs w-full sm:flex-1"
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
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card bg-carbon border border-industrial-border shadow-2xl">
          <div className="card-body">
            <h2 className="card-title border-b border-industrial-border pb-4 mb-4 flex justify-between items-center w-full">
              <div>
                <span className="text-text-secondary text-xs uppercase tracking-widest block mb-1">Telemetry History</span>
                <span className="text-3xl font-black italic uppercase text-white tracking-tighter">
                  Mileage Log {selectedCar && <span className="text-emerald-500">— {selectedCar.name}</span>}
                </span>
              </div>
              <button 
                disabled={!canExportPDF()}
                className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                  canExportPDF() 
                    ? 'border-neon-violet text-neon-violet hover:bg-neon-violet hover:text-asphalt shadow-neon' 
                    : 'border-industrial-border text-text-secondary opacity-50 cursor-not-allowed'
                }`}
                onClick={() => cyberToast.info('Exporting PDF...')}
              >
                <span className="inline-flex items-center gap-1.5">
                  {canExportPDF() ? <FileText className="w-3.5 h-3.5" aria-hidden="true" /> : <Lock className="w-3.5 h-3.5" aria-hidden="true" />}
                  {canExportPDF() ? 'Export PDF' : 'Export PDF (PRO)'}
                </span>
              </button>
            </h2>
            <div className="flex flex-col gap-4 mt-2">
              {!selectedCar ? (
                <div className="h-64 flex items-center justify-center bg-carbon border border-industrial-border border-dashed opacity-50 rounded-sm">
                  <p className="font-black uppercase tracking-widest italic">Initialize vehicle selection to view telemetry</p>
                </div>
              ) : records.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-carbon border border-industrial-border border-dashed opacity-50 rounded-sm">
                  <p className="font-black uppercase tracking-widest italic">No logs generated yet</p>
                </div>
              ) : (
                [...records].reverse().map(record => {
                  const isEV = record.fuelType === 'ELECTRICITY';
                  return (
                    <div key={record.id} className="p-5 bg-asphalt border border-industrial-border rounded-sm relative group hover:border-neon-violet/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{record.displayDate}</div>
                          <div className="inline-block mt-1 px-3 py-1.5 bg-gauge-face border border-chrome/20 rounded-sm">
                            <div className="text-2xl font-black italic text-led-amber font-mono tabular-nums tracking-tighter">{formatPrice(record.fuelCost)}</div>
                          </div>
                          <div className="text-xs uppercase font-bold text-text-secondary mt-2 flex gap-2 items-center">
                            {isEV ? (
                              <>
                                <span className="text-emerald-500 inline-flex items-center gap-1"><Zap className="w-3.5 h-3.5" aria-hidden="true" /> {(record.kwhAdded || 0).toFixed(2)} kWh</span>
                                <span>//</span>
                                <span>{formatPrice(record.pricePerKwh)} / kWh</span>
                              </>
                            ) : (
                              <>
                                <span className="text-emerald-500 inline-flex items-center gap-1"><Droplet className="w-3.5 h-3.5" aria-hidden="true" /> {(record.litresRefueled || 0).toFixed(2)} L</span>
                                <span>//</span>
                                <span>{formatPrice(record.pricePerLitre)} / L</span>
                              </>
                            )}
                          </div>
                          <div className="mt-3 text-xs uppercase font-black tracking-widest">
                            {record.isFullTank && record.consumptionRate !== null
                              ? <span className="text-neon-violet inline-flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> {record.consumptionRate.toFixed(2)} {isEV ? 'km/kWh' : 'km/L'}</span>
                              : <span className="text-text-secondary inline-flex items-center gap-1"><Minus className="w-3.5 h-3.5" aria-hidden="true" /> Partially Filled</span>}
                          </div>
                          {record.submittedBy && (
                            <div className="mt-2 text-[9px] uppercase font-bold text-text-secondary tracking-widest">
                              Operator: {record.submittedBy.name}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="inline-block px-3 py-1.5 bg-gauge-face border border-chrome/20 rounded-sm">
                            <div className="font-black italic text-xl text-led-amber font-mono tabular-nums tracking-tighter">{record.odometer} km</div>
                          </div>
                          {record.distanceTraveled > 0 && <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1.5">+{record.distanceTraveled} km</div>}

                          <div className="flex gap-2 justify-end mt-4">
                            {canEditRecord(record) && (
                              <button onClick={() => setEditingRecord(record)} className="px-3 py-1.5 border border-industrial-border text-[10px] uppercase font-black tracking-widest text-text-secondary hover:text-white hover:border-neon-violet transition-colors rounded-sm">
                                Edit
                              </button>
                            )}
                            {canDeleteRecord() && (
                              <button onClick={() => handleDelete(record.id)} className="px-3 py-1.5 border border-industrial-border text-[10px] uppercase font-black tracking-widest text-text-secondary hover:text-red-500 hover:border-red-500 transition-colors rounded-sm">
                                Purge
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {editingRecord && (
          <EditFuelRecordModal
            isOpen={!!editingRecord}
            onClose={() => setEditingRecord(null)}
            record={editingRecord}
            car={selectedCar}
            onSave={handleUpdateRecord}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default MileageLog;
