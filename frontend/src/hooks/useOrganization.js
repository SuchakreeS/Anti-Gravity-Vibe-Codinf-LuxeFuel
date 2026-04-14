import { useState, useCallback } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';

export function useOrganization() {
  const [members, setMembers] = useState([]);
  const [orgInfo, setOrgInfo] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPagination, setAuditPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrganization = useCallback(async () => {
    try {
      const res = await api.get('/organization');
      setOrgInfo(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch organization', err);
      return null;
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/organization/members');
      setMembers(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch members', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (memberData) => {
    try {
      const res = await api.post('/organization/members', memberData);
      setMembers(prev => [...prev, res.data]);
      Swal.fire('Success', 'Member added successfully!', 'success');
      return res.data;
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to add member', 'error');
      throw err;
    }
  }, []);

  const removeMember = useCallback(async (memberId) => {
    try {
      await api.delete(`/organization/members/${memberId}`);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      Swal.fire('Removed', 'Member removed successfully.', 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to remove member', 'error');
      throw err;
    }
  }, []);

  const fetchAuditLogs = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.page) params.append('page', filters.page);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.logs);
      setAuditPagination(res.data.pagination);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
      return { logs: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orgInfo,
    members,
    auditLogs,
    auditPagination,
    loading,
    fetchOrganization,
    fetchMembers,
    addMember,
    removeMember,
    fetchAuditLogs
  };
}
