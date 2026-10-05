import React, { useState, useEffect } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { auditAPI } from '../../services/api';
import { AuditLog } from '../../types';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, string> = {
  CREATE_PARCEL: 'bg-green-100 text-green-700',
  UPDATE_PARCEL: 'bg-blue-100 text-blue-700',
  DELETE_PARCEL: 'bg-red-100 text-red-700',
  STATUS_UPDATE: 'bg-purple-100 text-purple-700',
  LOGIN: 'bg-gray-100 text-gray-600',
};

const AuditPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await auditAPI.getLogs({ page, limit: 20 });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 text-sm">{total} total entries</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-lg">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : logs.length === 0 ? <EmptyState icon={<ClipboardList size={28} className="text-gray-400" />} title="No audit logs yet" description="System actions will appear here." />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Time', 'Actor', 'Action', 'Entity', 'Entity ID'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {format(new Date(log.timestamp), 'dd MMM, HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{log.actorName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{log.entityType}</td>
                      <td className="px-4 py-3 font-mono text-blue-600">{log.entityId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 border-t border-gray-100">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} />
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default AuditPage;
