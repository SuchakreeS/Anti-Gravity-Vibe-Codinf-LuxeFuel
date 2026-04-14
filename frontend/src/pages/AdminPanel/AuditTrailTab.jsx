import React from 'react';
import { motion } from 'framer-motion';

function AuditTrailTab({
  auditFilters, setAuditFilters,
  auditPage, auditPagination,
  handleApplyAuditFilters, handleAuditPageChange,
  members, loading, auditLogs,
  formatAuditDetails
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl text-secondary border-b border-base-300 pb-3">
          📋 Audit Trail
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 p-3 bg-base-200 rounded-xl">
          <div className="form-control">
            <label className="label py-0"><span className="label-text text-xs opacity-50">User</span></label>
            <select 
              className="select select-bordered select-sm"
              value={auditFilters.userId}
              onChange={e => setAuditFilters({ ...auditFilters, userId: e.target.value })}
            >
              <option value="">All Users</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-0"><span className="label-text text-xs opacity-50">Entity Type</span></label>
            <select 
              className="select select-bordered select-sm"
              value={auditFilters.entityType}
              onChange={e => setAuditFilters({ ...auditFilters, entityType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="FuelRecord">Fuel Record</option>
              <option value="Car">Car</option>
              <option value="User">User</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label py-0"><span className="label-text text-xs opacity-50">From</span></label>
            <input 
              type="date" 
              className="input input-bordered input-sm"
              value={auditFilters.from}
              onChange={e => setAuditFilters({ ...auditFilters, from: e.target.value })}
            />
          </div>
          <div className="form-control">
            <label className="label py-0"><span className="label-text text-xs opacity-50">To</span></label>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="input input-bordered input-sm flex-1"
                value={auditFilters.to}
                onChange={e => setAuditFilters({ ...auditFilters, to: e.target.value })}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleApplyAuditFilters}>
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log List */}
        <div className="flex flex-col gap-2 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg text-secondary"></span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center opacity-50 py-8">No audit logs found.</div>
          ) : (
            auditLogs.map(log => {
              const details = formatAuditDetails(log.details);
              const actionColors = {
                'CREATE': 'badge-success',
                'UPDATE': 'badge-warning',
                'DELETE': 'badge-error'
              };

              return (
                <div key={log.id} className="p-4 bg-base-200 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`badge ${actionColors[log.action] || 'badge-ghost'} badge-sm font-bold`}>
                        {log.action}
                      </div>
                      <div>
                        <span className="font-medium">{log.user?.name || 'Unknown'}</span>
                        <span className="opacity-50 mx-1">→</span>
                        <span className="opacity-70">{log.entityType} #{log.entityId}</span>
                      </div>
                    </div>
                    <div className="text-xs opacity-40 text-right whitespace-nowrap">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  {/* Details */}
                  {details && (
                    <div className="mt-3 text-sm">
                      {details.type === 'diff' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-2 bg-error/10 rounded-lg border border-error/20">
                            <div className="text-xs font-semibold text-error mb-1">Before</div>
                            {Object.entries(details.before).map(([key, val]) => (
                              <div key={key} className="flex justify-between text-xs py-0.5">
                                <span className="opacity-60">{key}:</span>
                                <span className="font-mono">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                            <div className="text-xs font-semibold text-success mb-1">After</div>
                            {Object.entries(details.after).map(([key, val]) => (
                              <div key={key} className="flex justify-between text-xs py-0.5">
                                <span className="opacity-60">{key}:</span>
                                <span className="font-mono">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {details.type === 'data' && (
                        <div className="p-2 bg-base-300 rounded-lg">
                          {Object.entries(details.data).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-xs py-0.5">
                              <span className="opacity-60">{key}:</span>
                              <span className="font-mono">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {auditPagination && auditPagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button 
              className="btn btn-sm btn-ghost"
              disabled={auditPage <= 1}
              onClick={() => handleAuditPageChange(auditPage - 1)}
            >
              ← Prev
            </button>
            <span className="btn btn-sm btn-ghost no-animation">
              {auditPage} / {auditPagination.totalPages}
            </span>
            <button 
              className="btn btn-sm btn-ghost"
              disabled={auditPage >= auditPagination.totalPages}
              onClick={() => handleAuditPageChange(auditPage + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AuditTrailTab;
