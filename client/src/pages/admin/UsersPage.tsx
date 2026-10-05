import React, { useState, useEffect } from 'react';
import { Users2, Shield, RefreshCw, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { userAPI } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-blue-100 text-blue-700',
  DELIVERY_AGENT: 'bg-orange-100 text-orange-700',
  CUSTOMER: 'bg-green-100 text-green-700',
  SUPPORT: 'bg-purple-100 text-purple-700',
};

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [toggleTarget, setToggleTarget] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll({ role: roleFilter || undefined });
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await userAPI.delete(deleteTarget._id); toast.success('User deleted!'); fetchUsers(); }
    catch { toast.error('Failed to delete user'); }
    setDeleteTarget(null);
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      await userAPI.toggleStatus(toggleTarget._id);
      toast.success(`User ${toggleTarget.isActive ? 'deactivated' : 'activated'}!`);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
    setToggleTarget(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">{users.length} users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-lg">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Roles</option>
          {['ADMIN', 'DELIVERY_AGENT', 'CUSTOMER', 'SUPPORT'].map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : users.length === 0 ? <EmptyState icon={<Users2 size={28} className="text-gray-400" />} title="No users found" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setToggleTarget(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}>
                            {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button onClick={() => setDeleteTarget(u)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <ConfirmDialog isOpen={!!toggleTarget} onClose={() => setToggleTarget(null)} onConfirm={handleToggle}
        title={`${toggleTarget?.isActive ? 'Deactivate' : 'Activate'} User`}
        message={`Are you sure you want to ${toggleTarget?.isActive ? 'deactivate' : 'activate'} ${toggleTarget?.name}?`}
        confirmText={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        isDangerous={toggleTarget?.isActive} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete User" isDangerous message={`Permanently delete "${deleteTarget?.name}"?`} confirmText="Delete User" />
    </div>
  );
};

export default UsersPage;
