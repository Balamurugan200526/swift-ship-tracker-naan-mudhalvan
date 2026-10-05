import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, RefreshCw, Filter } from 'lucide-react';
import { parcelAPI, senderAPI, receiverAPI, userAPI } from '../../services/api';
import { Parcel, Sender, Receiver } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import TrackingTimeline from '../../components/TrackingTimeline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUSES = ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Cancelled'];
const LOCATIONS = ['Warehouse', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Thanjavur', 'Mayiladuthurai', 'Vellore', 'Erode'];

const ParcelsPage = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'status' | null>(null);
  const [selected, setSelected] = useState<Parcel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Parcel | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [viewHistory, setViewHistory] = useState<any[]>([]);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await parcelAPI.getAll({ page, limit: 10, status: statusFilter || undefined, search: search || undefined });
      setParcels(data.parcels || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Failed to load parcels'); }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchParcels(); }, [fetchParcels]);
  useEffect(() => {
    senderAPI.getAll().then(r => setSenders(r.data)).catch(() => {});
    receiverAPI.getAll().then(r => setReceivers(r.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    const today = new Date(); today.setDate(today.getDate() + 7);
    setFormData({ weight: '', description: '', estimatedDeliveryDate: today.toISOString().split('T')[0], senderId: '', receiverId: '' });
    setModalType('create');
  };

  const openEdit = (p: Parcel) => {
    setSelected(p);
    setFormData({
      weight: p.weight, description: p.description || '', status: p.status,
      estimatedDeliveryDate: p.estimatedDeliveryDate.split('T')[0],
      senderId: (p.senderId as any)?._id || p.senderId,
      receiverId: (p.receiverId as any)?._id || p.receiverId,
    });
    setModalType('edit');
  };

  const openView = async (p: Parcel) => {
    setSelected(p);
    try {
      const { data } = await parcelAPI.getById(p._id);
      setSelected(data.parcel);
      setViewHistory(data.history || []);
    } catch {}
    setModalType('view');
  };

  const openStatusUpdate = (p: Parcel) => {
    setSelected(p);
    setFormData({ status: p.status, location: 'Chennai', notes: '' });
    setModalType('status');
  };

  const handleCreate = async () => {
    try {
      await parcelAPI.create(formData);
      toast.success('Parcel created successfully!');
      setModalType(null);
      fetchParcels();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to create parcel'); }
  };

  const handleEdit = async () => {
    if (!selected) return;
    try {
      await parcelAPI.update(selected._id, formData);
      toast.success('Parcel updated!');
      setModalType(null);
      fetchParcels();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to update parcel'); }
  };

  const handleStatusUpdate = async () => {
    if (!selected) return;
    try {
      await parcelAPI.updateStatus(selected._id, formData);
      toast.success('Status updated!');
      setModalType(null);
      fetchParcels();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await parcelAPI.delete(deleteTarget._id);
      toast.success('Parcel deleted!');
      fetchParcels();
    } catch { toast.error('Failed to delete parcel'); }
    setDeleteTarget(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parcel Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} parcels total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
          <Plus size={16} /> Create Parcel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search parcel ID..."
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={fetchParcels} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : parcels.length === 0 ? (
          <EmptyState title="No parcels found" description="Create your first parcel or adjust the filters." action={
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={14} className="inline mr-1" />Create Parcel</button>
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Parcel ID', 'Sender', 'Receiver', 'Weight', 'Status', 'ETA', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parcels.map(p => {
                  const sender = p.senderId as any;
                  const receiver = p.receiverId as any;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600">{p.parcelId}</td>
                      <td className="px-4 py-3 text-gray-700">{sender?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{receiver?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{p.weight} kg</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{format(new Date(p.estimatedDeliveryDate), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openView(p)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="View"><Eye size={15} /></button>
                          <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => openStatusUpdate(p)} className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors text-xs font-medium px-2">Status</button>
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} />
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalType === 'create' || modalType === 'edit'} onClose={() => setModalType(null)}
        title={modalType === 'create' ? 'Create New Parcel' : 'Edit Parcel'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender *</label>
              <select value={formData.senderId || ''} onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select sender</option>
                {senders.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver *</label>
              <select value={formData.receiverId || ''} onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select receiver</option>
                {receivers.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
              <input type="number" min="0.1" step="0.1" value={formData.weight || ''} onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date *</label>
              <input type="date" value={formData.estimatedDeliveryDate || ''} onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Electronics, Documents" />
          </div>
          {modalType === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status || ''} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalType(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={modalType === 'create' ? handleCreate : handleEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              {modalType === 'create' ? 'Create Parcel' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modalType === 'view'} onClose={() => setModalType(null)} title={`Parcel ${selected?.parcelId}`} size="xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-blue-600 font-bold text-lg">{selected.parcelId}</span>
              <StatusBadge status={selected.status} size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Weight', `${selected.weight} kg`],
                ['Description', selected.description || 'N/A'],
                ['ETA', format(new Date(selected.estimatedDeliveryDate), 'dd MMM yyyy')],
                ['Sender', (selected.senderId as any)?.name],
                ['Receiver', (selected.receiverId as any)?.name],
                ['Receiver Address', (selected.receiverId as any)?.address],
              ].map(([k, v]) => (
                <div key={k}><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="font-medium text-gray-800">{v || '—'}</p></div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Tracking Timeline</h3>
              <TrackingTimeline currentStatus={selected.status} history={viewHistory} />
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={modalType === 'status'} onClose={() => setModalType(null)} title="Update Parcel Status" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select value={formData.status || ''} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
            <select value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Optional delivery notes..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModalType(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleStatusUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Update Status</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Parcel" isDangerous
        message={`Are you sure you want to delete parcel ${deleteTarget?.parcelId}? This action cannot be undone.`}
        confirmText="Delete Parcel"
      />
    </div>
  );
};

export default ParcelsPage;
