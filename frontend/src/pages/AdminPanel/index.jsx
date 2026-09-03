import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, Car, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrganization } from '../../hooks/useOrganization';
import { useCars } from '../../hooks/useCars';
import Layout from '../../components/Layout';
import { cyberToast } from '../../components/CyberToast';

import MembersTab from './MembersTab';
import FleetTab from './FleetTab';
import AuditTrailTab from './AuditTrailTab';
import CommandCenterTab from './CommandCenterTab';

import PremiumGuard from '../../components/PremiumGuard';

function AdminPanel() {
  const { user } = useAuthStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { 
    orgInfo, members, auditLogs, auditPagination, loading,
    fetchOrganization, fetchMembers, addMember, removeMember, fetchAuditLogs
  } = useOrganization();
  const { 
    cars, orgCars, addCar, updateCar, deleteCar, makes, models, loadingMakes, loadingModels, fetchMakes, fetchModels 
  } = useCars(user);

  const [activeTab, setActiveTab] = useState('members');
  const [editingCar, setEditingCar] = useState(null);

  // Member form
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', password: '' });

  // Car form
  const [showCarForm, setShowCarForm] = useState(false);
  const [carForm, setCarForm] = useState({ name: '', brand: '', model: '', licensePlate: '', tankSize: '', otherSpecs: '' });
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Audit filters
  const [auditFilters, setAuditFilters] = useState({ userId: '', entityType: '', from: '', to: '' });
  const [auditPage, setAuditPage] = useState(1);

  const openEditCar = (car) => {
    setEditingCar(car);
    setCarForm({ 
      name: car.name, 
      brand: car.brand, 
      model: car.model, 
      licensePlate: car.licensePlate || '', 
      tankSize: car.tankSize || '',
      otherSpecs: car.otherSpecs || '' 
    });
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...carForm, 
        tankSize: carForm.tankSize ? parseFloat(carForm.tankSize) : null 
      };
      await updateCar(editingCar.id, payload);
      setEditingCar(null);
      setCarForm({ name: '', brand: '', model: '', licensePlate: '', tankSize: '', otherSpecs: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCar = async (carId) => {
    const confirmed = await cyberToast.confirm('This will permanently delete the car and ALL its fuel records. Continue?');
    if (confirmed) {
      try {
        await deleteCar(carId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchOrganization();
    fetchMembers();
    fetchAuditLogs();
  }, [fetchOrganization, fetchMembers, fetchAuditLogs]);

  useEffect(() => {
    if (showCarForm && makes.length === 0) {
      fetchMakes();
    }
  }, [showCarForm, makes.length, fetchMakes]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addMember(memberForm);
      setMemberForm({ name: '', email: '', password: '' });
      setShowMemberForm(false);
    } catch {}
  };

  const handleRemoveMember = async (memberId, memberName) => {
    const confirmed = await cyberToast.confirm(`Remove ${memberName}? This will permanently remove this member and their personal data.`);
    if (confirmed) {
      await removeMember(memberId);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...carForm, 
        isPersonal: false,
        tankSize: carForm.tankSize ? parseFloat(carForm.tankSize) : null
      };
      await addCar(payload);
      setCarForm({ name: '', brand: '', model: '', licensePlate: '', tankSize: '', otherSpecs: '' });
      setShowCarForm(false);
    } catch {}
  };

  const handleApplyAuditFilters = () => {
    setAuditPage(1);
    fetchAuditLogs({ ...auditFilters, page: 1 });
  };

  const handleAuditPageChange = (newPage) => {
    setAuditPage(newPage);
    fetchAuditLogs({ ...auditFilters, page: newPage });
  };

  const formatAuditDetails = (details) => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      if (parsed.before && parsed.after) {
        return { type: 'diff', before: parsed.before, after: parsed.after };
      }
      return { type: 'data', data: parsed };
    } catch {
      return { type: 'text', data: details };
    }
  };

  const tabs = [
    { id: 'command', label: 'Command Center', icon: Radio },
    { id: 'members', label: 'Members', icon: Users, count: members.length },
    { id: 'cars', label: 'Fleet', icon: Car, count: orgCars.length },
    { id: 'audit', label: 'Audit Trail', icon: ClipboardList, count: auditPagination?.total || 0 }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            {orgInfo && (
              <span className="badge badge-primary badge-lg">{orgInfo.name}</span>
            )}
          </div>
          <p className="text-text-secondary">Manage your organization, fleet, and view activity.</p>
        </motion.div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 mb-6 p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab tab-lg flex-1 gap-2 transition-all ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="badge badge-sm bg-base-300 text-base-content border-base-content/10">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'command' && (
          <PremiumGuard planRequired="ENTERPRISE">
            <CommandCenterTab />
          </PremiumGuard>
        )}

        {activeTab === 'members' && (
          <MembersTab 
            members={members}
            showMemberForm={showMemberForm}
            setShowMemberForm={setShowMemberForm}
            memberForm={memberForm}
            setMemberForm={setMemberForm}
            handleAddMember={handleAddMember}
            handleRemoveMember={handleRemoveMember}
          />
        )}

        {activeTab === 'cars' && (
          <FleetTab 
            orgCars={orgCars}
            showCarForm={showCarForm}
            setShowCarForm={setShowCarForm}
            carForm={carForm}
            setCarForm={setCarForm}
            isManualEntry={isManualEntry}
            setIsManualEntry={setIsManualEntry}
            makes={makes}
            models={models}
            loadingModels={loadingModels}
            fetchModels={fetchModels}
            handleAddCar={handleAddCar}
            editingCar={editingCar}
            openEditCar={openEditCar}
            handleUpdateCar={handleUpdateCar}
            handleDeleteCar={handleDeleteCar}
            setEditingCar={setEditingCar}
          />
        )}

        {activeTab === 'audit' && (
          <PremiumGuard planRequired="ENTERPRISE">
            <AuditTrailTab 
              auditFilters={auditFilters}
              setAuditFilters={setAuditFilters}
              auditPage={auditPage}
              auditPagination={auditPagination}
              handleApplyAuditFilters={handleApplyAuditFilters}
              handleAuditPageChange={handleAuditPageChange}
              members={members}
              loading={loading}
              auditLogs={auditLogs}
              formatAuditDetails={formatAuditDetails}
              cars={cars}
            />
          </PremiumGuard>
        )}

      </div>
    </Layout>
  );
}

export default AdminPanel;
