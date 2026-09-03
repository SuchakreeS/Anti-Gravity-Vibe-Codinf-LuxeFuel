import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileDown, Fuel, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCars } from '../hooks/useCars';
import { useFuelRecords } from '../hooks/useFuelRecords';
import Layout from '../components/Layout';
import FuelEntryForm from './Dashboard/components/FuelEntryForm';
import DashboardCharts from './Dashboard/components/DashboardCharts';
import AddCarModal from './Dashboard/components/AddCarModal';
import AllCarsModal from './Dashboard/components/AllCarsModal';
import DashboardStats from './Dashboard/components/DashboardStats';
import EcoPulseCard from '../components/dashboard/EcoPulseCard';
import OperatorRankCard from '../components/dashboard/OperatorRankCard';
import PriceTicker from '../components/dashboard/PriceTicker';
import { useVehicleStore } from '../store/useVehicleStore';
import PremiumGuard from '../components/PremiumGuard';
import EmptyState from '../components/dashboard/EmptyState';
import { ASSETS } from '../utils/assets';
import { generateFuelReport } from '../utils/reportGenerator';

function Dashboard() {
  const { user } = useAuthStore();
  const canExportPDF = useAuthStore((state) => state.canExportPDF);
  const {
    cars,
    selectedCar,
    setSelectedCar,
    fetchCars,
  } = useVehicleStore();

  const {
    makes,
    models,
    loadingMakes,
    loadingModels,
    fetchModels,
    addCar
  } = useCars(user);

  const {
    records,
    convertedRecords,
    addRecord,
    stats
  } = useFuelRecords(selectedCar?.id);

  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showAllCars, setShowAllCars] = useState(false);
  const [useHundredKm, setUseHundredKm] = useState(false);

  useEffect(() => {
    if (cars.length === 0 && user) {
      fetchCars().then(data => {
        if (data && data.length === 0) setShowAddCarModal(true);
      });
    } else if (cars.length > 0 && !selectedCar) {
      setSelectedCar(cars[0]);
    }
  }, [cars.length, user, selectedCar, setSelectedCar, fetchCars]);

  const handleAddFuel = async (payload) => {
    if (!selectedCar) return;
    await addRecord(selectedCar.id, payload);
  };

  const handleAddOnboardingCar = async (carData) => {
    const newCar = await addCar(carData);
    if (newCar) {
      setShowAddCarModal(false);
      fetchCars(); // Refresh store
      setSelectedCar(newCar);
    }
  };

  const userRole = user?.role || 'individual';

  const sortedCars = [...cars].sort((a, b) => {
    if (a.id === selectedCar?.id) return -1;
    if (b.id === selectedCar?.id) return 1;
    return 0;
  });

  return (
    <Layout>
      <div className="mb-6">
        <PriceTicker />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Controls */}
        <div className="flex flex-col gap-6">
          {/* Operator Profile & Rank (Gated) */}
          <PremiumGuard planRequired="PRO">
            <OperatorRankCard
              user={user}
              records={records}
            />
          </PremiumGuard>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="card bg-carbon border border-industrial-border shadow-2xl">
            <div className="card-body">
              <div className="flex justify-between items-center border-b border-industrial-border pb-2 mb-2">
                <h2 className="card-title text-neon-violet italic uppercase font-black tracking-widest text-lg leading-none">Select Car</h2>
                <button
                  onClick={() => setShowAddCarModal(true)}
                  className="w-6 h-6 rounded-sm bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center text-neon-violet hover:bg-neon-violet hover:text-white transition-all shadow-neon hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                  title="Add New Vehicle"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {sortedCars.slice(0, 3).map(c => (
                  <button
                    key={c.id}
                    className={`w-full text-left p-3 rounded-sm transition-all border flex items-center gap-3 ${selectedCar?.id === c.id
                      ? 'bg-secondary text-secondary-content border-secondary shadow-neon'
                      : 'bg-base-200 hover:bg-base-300 border-industrial-border text-text-primary'
                      }`}
                    onClick={() => setSelectedCar(c)}
                  >
                    <img
                      src={c.photoUrl || ASSETS.DEFAULT_CAR}
                      alt={c.name}
                      className="w-10 h-10 rounded-sm object-cover border border-industrial-border"
                    />
                    <div>
                      <div className="font-bold uppercase italic text-sm">{c.name}</div>
                      <div className={`text-[10px] uppercase font-black ${selectedCar?.id === c.id ? 'opacity-80' : 'opacity-40'}`}>
                        {c.brand} {c.model} {c.licensePlate ? `• ${c.licensePlate}` : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {cars.length > 3 && (
                <button 
                  onClick={() => setShowAllCars(true)}
                  className="w-full mt-3 text-[10px] uppercase font-black tracking-widest text-text-secondary hover:text-neon-violet transition-colors py-2 border border-industrial-border hover:border-neon-violet/50 rounded-sm"
                >
                  View All Vehicles ({cars.length})
                </button>
              )}

              {cars.length === 0 && (
                <div className="text-center opacity-50 py-4 text-xs uppercase font-bold tracking-widest">
                  No vehicles synced.<br />
                  <span className="text-neon-violet">Update fleet in profile.</span>
                </div>
              )}
            </div>
          </motion.div>

          {selectedCar && (
            <div className="card bg-carbon shadow-2xl border border-industrial-border">
              <div className="card-body items-center text-center">
                <h3 className="font-bold text-text-secondary text-xs uppercase tracking-widest">
                  {selectedCar.engineType === 'EV' ? 'Log Charging Session' : 'Add Fuel Record'}
                </h3>
                <button
                  onClick={() => setShowFuelModal(true)}
                  className="btn btn-circle bg-jdm-purple hover:bg-neon-violet text-white btn-lg mt-2 shadow-neon hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-500 border-none"
                >
                  {selectedCar.engineType === 'EV' ? (
                    <Zap className="w-8 h-8 text-neon-violet" />
                  ) : (
                    <Fuel className="w-8 h-8 text-neon-violet" />
                  )}
                </button>
              </div>
            </div>
          )}

          {selectedCar && stats && (
            <>
              <DashboardStats 
                stats={stats} 
                car={selectedCar} 
                useHundredKm={useHundredKm} 
                setUseHundredKm={setUseHundredKm} 
              />
              {canExportPDF() && (
                <button
                  onClick={() => generateFuelReport(selectedCar, records, stats)}
                  className="btn btn-outline btn-accent w-full mt-4 flex items-center justify-center gap-2 uppercase font-black italic tracking-widest text-xs border-2 shadow-neon hover:bg-accent hover:text-black transition-all duration-300"
                >
                  <FileDown className="w-4 h-4" />
                  Export Telemetry PDF
                </button>
              )}
            </>
          )}

        </div>

        {/* Main Content Area — Charts */}
        {!selectedCar ? (
          <div className="lg:col-span-2 flex">
            <EmptyState message="Select or initialize a vehicle to access telemetry" height="h-[500px]" />
          </div>
        ) : (
          <div className="lg:col-span-2 flex flex-col gap-6">
            <DashboardCharts
              records={records}
              convertedRecords={convertedRecords}
              car={selectedCar}
              useHundredKm={useHundredKm}
              setUseHundredKm={setUseHundredKm}
            />
            
            <PremiumGuard planRequired="PRO">
              <EcoPulseCard
                records={records}
                car={selectedCar}
              />
            </PremiumGuard>
          </div>
        )}
      </div>

      {showAddCarModal && (
        <AddCarModal
          onAddCar={handleAddOnboardingCar}
          onClose={() => setShowAddCarModal(false)}
          makes={makes}
          models={models}
          fetchModels={fetchModels}
          loadingMakes={loadingMakes}
          loadingModels={loadingModels}
          userRole={userRole}
        />
      )}

      {showFuelModal && selectedCar && (
        <FuelEntryForm
          selectedCar={selectedCar}
          onAddFuel={handleAddFuel}
          stats={stats}
          onClose={() => setShowFuelModal(false)}
        />
      )}

      {showAllCars && (
        <AllCarsModal 
          cars={cars} 
          selectedCar={selectedCar} 
          setSelectedCar={setSelectedCar} 
          onClose={() => setShowAllCars(false)} 
        />
      )}
    </Layout>
  );
}

export default Dashboard;
