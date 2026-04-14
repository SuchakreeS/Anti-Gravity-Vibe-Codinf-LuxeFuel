import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrganization } from '../../hooks/useOrganization';
import { useCars } from '../../hooks/useCars';
import Layout from '../../components/Layout';
import Swal from 'sweetalert2';

import MembersTab from './MembersTab';
import FleetTab from './FleetTab';
import AuditTrailTab from './AuditTrailTab';

function AdminPanel() {
  const { user } = useAuthStore();
  const { 
    orgInfo, members, auditLogs, auditPagination, loading,
    fetchOrganization, fetchMembers, addMember, removeMember, fetchAuditLogs
  } = useOrganization();
  const { 
    orgCars, addCar, makes, models, loadingMakes, loadingModels, fetchMakes, fetchModels 
  } = useCars(user);

  const [activeTab, setActiveTab] = useState('members');
  
  // Member form
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', password: '' });
  
  // Car form
  const [showCarForm, setShowCarForm] = useState(false);
  const [carForm, setCarForm] = useState({ name: '', brand: '', model: '', licensePlate: '', otherSpecs: '' });
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  // Audit filters
  const [auditFilters, setAuditFilters] = useState({ userId: '', entityType: '', from: '', to: '' });
  const [auditPage, setAuditPage] = useState(1);

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
    const confirm = await Swal.fire({
      title: `Remove ${memberName}?`,
      text: 'This will permanently remove this member and their personal data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      confirmButtonColor: '#ef4444'
    });
    if (confirm.isConfirmed) {
      await removeMember(memberId);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await addCar({ ...carForm, isPersonal: false });
      setCarForm({ name: '', brand: '', model: '', licensePlate: '', otherSpecs: '' });
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
    { id: 'members', label: '👥 Members', count: members.length },
    { id: 'cars', label: '🚗 Fleet', count: orgCars.length },
    { id: 'audit', label: '📋 Audit Trail', count: auditPagination?.total || 0 },
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
          <p className="opacity-50">Manage your organization, fleet, and view activity.</p>
        </motion.div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 mb-6 p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab tab-lg flex-1 gap-2 transition-all ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="badge badge-sm badge-ghost">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
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
          />
        )}

        {activeTab === 'audit' && (
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
          />
        )}

      </div>
    </Layout>
  );
}

export default AdminPanel;
