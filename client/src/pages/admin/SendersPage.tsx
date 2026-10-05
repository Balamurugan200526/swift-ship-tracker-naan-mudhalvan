import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { senderAPI } from '../../services/api';
import { Sender } from '../../types';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';

const FIELDS = [
  { name: 'name',    label: 'Full Name',    type: 'text',  placeholder: 'Rajesh Kumar' },
  { name: 'email',   label: 'Email',        type: 'email', placeholder: 'rajesh@gmail.com' },
  { name: 'phone',   label: 'Phone',        type: 'tel',   placeholder: '9876543210' },
  { name: 'address', label: 'Address',      type: 'text',  placeholder: '45, Anna Nagar, Chennai' },
];

const SendersPage = () => {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Sender | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sender | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [viewParcels, setViewParcels] = useState<any[]>([]);

  const fetchSenders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await senderAPI.getAll({ search: search || undefined });
      setSenders(data);
    } catch { toast.error('Failed to load senders'); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchSenders(); }, [fetchSenders]);

  const openCreate = () => { setFormData({}); setModalType('create'); };
  const openEdit = (s: Sender) => { setSelected(s); setFormData({ ...s }); setModalType('edit'); };
  const openView = async (s: Sender) => {
    setSelected(s);
    try { const { data } = await senderAPI.getParcels(s._id); setViewParcels(data); } catch { setViewParcels([]); }
    setModalType('view');
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) { toast.error('All fields required'); return; }
    try { await senderAPI.create(formData); toast.success('Sender created!'); setModalType(null); fetchSenders(); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to create'); }
  };

  const handleEdit = async () => {
    if (!selected) return;
    try { await senderAPI.update(selected._id, formData); toast.success('Sender updated!'); setModalType(null); fetchSenders(); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await senderAPI.delete(deleteTarget._id); toast.success('Sender deleted!'); fetchSenders(); }
    catch { toast.error('Failed to delete sender'); }
    setDeleteTarget(null);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sender Management</h1>
          <p className="text-gray-500 text-sm">{senders.length} senders</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
          <Plus size={16} /> Add Sender
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search name, email or phone..." />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : senders.length === 0 ? <EmptyState title="No senders found" description="Add your first sender to get started." action={<button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add Sender</button>} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Name', 'Email', 'Phone', 'Address', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {senders.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.email}</td>
                      <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{s.address}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openView(s)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Eye size={15} /></button>
                          <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteTarget(s)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalType === 'create' || modalType === 'edit'} onClose={() => setModalType(null)}
        title={modalType === 'create' ? 'Add New Sender' : 'Edit Sender'}>
        <div className="space-y-4">
          {FIELDS.map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} *</label>
              <input type={f.type} value={formData[f.name] || ''} onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={f.placeholder} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalType(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            <button onClick={modalType === 'create' ? handleCreate : handleEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
              {modalType === 'create' ? 'Add Sender' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modalType === 'view'} onClose={() => setModalType(null)} title={`${selected?.name}'s Details`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Name', selected.name], ['Email', selected.email], ['Phone', selected.phone], ['Address', selected.address]].map(([k, v]) => (
                <div key={k}><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="font-medium text-gray-800">{v}</p></div>
              ))}
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Parcels Sent ({viewParcels.length})</h3>
              {viewParcels.length === 0 ? <p className="text-gray-400 text-sm">No parcels sent yet</p> : (
                <div className="space-y-2">
                  {viewParcels.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="font-mono font-semibold text-blue-600">{p.parcelId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Sender" isDangerous message={`Delete sender "${deleteTarget?.name}"? This cannot be undone.`} confirmText="Delete" />
    </div>
  );
};

export default SendersPage;
