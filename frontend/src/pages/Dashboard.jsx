import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCars } from '../hooks/useCars';
import { useFuelRecords } from '../hooks/useFuelRecords';
import Layout from '../components/Layout';
import FuelEntryForm from './Dashboard/components/FuelEntryForm';
import DashboardCharts from './Dashboard/components/DashboardCharts';
import AddCarModal from './Dashboard/components/AddCarModal';
import DashboardStats from './Dashboard/components/DashboardStats';
import MaintenanceCard from '../components/dashboard/MaintenanceCard';
import PriceTicker from '../components/dashboard/PriceTicker';
import ServiceTimeline from '../components/dashboard/ServiceTimeline';
import { estimateCurrentMileage } from '../utils/maintenance';
import { useVehicleStore } from '../store/useVehicleStore';
import MaintenanceForm from '../components/MaintenanceForm';
import PremiumGuard from '../components/PremiumGuard';

function Dashboard() {
  const { user } = useAuthStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isOrgUser = useAuthStore((state) => state.isOrgUser);
  const canAccessMaintenance = useAuthStore((state) => state.canAccessMaintenance);

  const { 
    cars, 
    selectedCar, 
    setSelectedCar, 
    fetchCars,
    loading: loadingCars
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

  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  useEffect(() => {
    if (cars.length === 0 && user) {
      fetchCars().then(data => {
        if (data && data.length === 0) setShowAddCarModal(true);
      });
    } else if (cars.length > 0) {
      if (!selectedCar) setSelectedCar(cars[0]);
      setShowAddCarModal(false);
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

  // Check if user can add cars
  const canAddCar = isAdmin() || !isOrgUser(); // admin or individual, not regular org user
  const userRole = user?.role || 'individual';

  return (
    <Layout>
      {/* Price Ticker — Full width across the top */}
      <div className="mb-6">
        <PriceTicker />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Controls */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="card bg-carbon border border-industrial-border shadow-2xl">
            <div className="card-body">
              <h2 className="card-title text-neon-violet border-b border-industrial-border pb-2 italic uppercase font-black tracking-widest">Select Car</h2>
              
              {/* Org cars group */}
              {cars.filter(c => !c.isPersonal).length > 0 && (
                <div className="mb-2">
                  <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Organization Fleet</label>
                  {cars.filter(c => !c.isPersonal).map(c => (
                    <button
                      key={c.id}
                      className={`w-full text-left p-2 rounded-lg mb-1 transition-all text-sm ${
                        selectedCar?.id === c.id 
                          ? 'bg-jdm-purple/40 border border-neon-violet/40' 
                          : 'bg-asphalt hover:bg-slate-800 border border-transparent'
                      }`}
                      onClick={() => setSelectedCar(c)}
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs opacity-60">{c.brand} {c.model} {c.licensePlate ? `• ${c.licensePlate}` : ''}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Personal cars group */}
              {cars.filter(c => c.isPersonal).length > 0 && (
                <div>
                  {cars.filter(c => !c.isPersonal).length > 0 && (
                    <label className="text-xs font-bold uppercase opacity-40 mb-1 block">Personal Cars</label>
                  )}
                  {cars.filter(c => c.isPersonal).map(c => (
                    <button
                      key={c.id}
                      className={`w-full text-left p-2 rounded-lg mb-1 transition-all text-sm ${
                        selectedCar?.id === c.id 
                          ? 'bg-jdm-purple/40 border border-neon-violet/40' 
                          : 'bg-asphalt hover:bg-slate-800 border border-transparent'
                      }`}
                      onClick={() => setSelectedCar(c)}
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs opacity-60">{c.brand} {c.model} {c.licensePlate ? `• ${c.licensePlate}` : ''}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Fallback select for simple case */}
              {cars.length === 0 && (
                <div className="text-center opacity-50 py-2 text-sm">No cars available</div>
              )}
            </div>
          </motion.div>

          {selectedCar && (
            <div className="card bg-carbon shadow-2xl border border-industrial-border">
              <div className="card-body items-center text-center">
                <h3 className="font-bold text-text-secondary text-xs uppercase tracking-widest">Add Fuel Record</h3>
                <button 
                  onClick={() => setShowFuelModal(true)}
                  className="btn btn-circle bg-jdm-purple hover:bg-neon-violet text-white btn-lg mt-2 shadow-neon hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-500 border-none"
                >
                  <span className="text-3xl">+</span>
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Stats */}
          {selectedCar && stats && (
             <DashboardStats stats={stats} />
          )}

          {/* Maintenance Card (Gated) */}
          {selectedCar && (
            <PremiumGuard planRequired="PRO">
              <MaintenanceCard 
                car={selectedCar} 
                currentMileage={estimateCurrentMileage(records[records.length - 1])} 
                onOpenService={() => setShowMaintenanceModal(true)}
              />
            </PremiumGuard>
          )}
        </div>

        {/* Main Content Area — Charts + Timeline */}
        {!selectedCar ? (
          <div className="lg:col-span-2 flex h-[500px] items-center justify-center opacity-50 text-xl text-center">
            Please select or add a car to view tracking data.
          </div>
        ) : (
          <div className="lg:col-span-2 flex flex-col gap-6">
            <DashboardCharts 
              records={records} 
              convertedRecords={convertedRecords} 
            />

            {/* Service Timeline */}
            <ServiceTimeline
              records={records}
              car={selectedCar}
              onOpenMaintenance={() => setShowMaintenanceModal(true)}
            />
          </div>
        )}
      </div>

      {showAddCarModal && (
        <AddCarModal 
          onAddCar={handleAddOnboardingCar}
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
      {showMaintenanceModal && selectedCar && (
        <MaintenanceForm 
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          carId={selectedCar.id}
          currentOdometer={estimateCurrentMileage(records[records.length - 1])}
        />
      )}
    </Layout>
  );
}

export default Dashboard;
