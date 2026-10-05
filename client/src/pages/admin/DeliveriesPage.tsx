import React, { useState, useEffect } from 'react';
import { Truck, MapPin, User, Eye, Pencil, RefreshCw } from 'lucide-react';
import { deliveryAPI, userAPI } from '../../services/api';
import { Delivery } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import DeliveryMap from '../../components/Map';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LOCATIONS = ['Warehouse', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Thanjavur', 'Mayiladuthurai', 'Vellore', 'Erode'];

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'view' | 'assign' | 'location' | null>(null);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, aRes] = await Promise.all([deliveryAPI.getAll(), userAPI.getAll({ role: 'DELIVERY_AGENT' })]);
      setDeliveries(dRes.data);
      setAgents(aRes.data);
    } catch { toast.error('Failed to load deliveries'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openView = (d: Delivery) => { setSelected(d); setModalType('view'); };
  const openAssign = (d: Delivery) => { setSelected(d); setFormData({ deliveryAgentId: (d.deliveryAgentId as any)?._id || '' }); setModalType('assign'); };
  const openLocation = (d: Delivery) => { setSelected(d); setFormData({ currentLocation: d.currentLocation, deliveryNotes: d.deliveryNotes || '' }); setModalType('location'); };

  const handleAssign = async () => {
    if (!selected || !formData.deliveryAgentId) return;
    try { await deliveryAPI.assignAgent(selected._id, formData); toast.success('Agent assigned!'); setModalType(null); fetchData(); }
    catch { toast.error('Failed to assign agent'); }
  };

  const handleLocation = async () => {
    if (!selected) return;
    try { await deliveryAPI.updateLocation(selected._id, formData); toast.success('Location updated!'); setModalType(null); fetchData(); }
    catch { toast.error('Failed to update location'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-500 text-sm">{deliveries.length} deliveries</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-lg hover:border-blue-300 transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : deliveries.length === 0 ? <EmptyState title="No deliveries yet" description="Deliveries are created automatically when parcels are booked." />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Delivery ID', 'Parcel', 'Agent', 'Location', 'Status', 'Last Updated', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deliveries.map(d => {
                    const parcel = d.parcelId as any;
                    const agent = d.deliveryAgentId as any;
                    return (
                      <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">{d.deliveryId}</td>
                        <td className="px-4 py-3 font-mono text-gray-700">{parcel?.parcelId || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{agent?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                        <td className="px-4 py-3 text-gray-600 flex items-center gap-1">
                          <MapPin size={13} className="text-blue-500 flex-shrink-0" />{d.currentLocation || '—'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3 text-gray-500">{d.lastUpdated ? format(new Date(d.lastUpdated), 'dd MMM, HH:mm') : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openView(d)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"><Eye size={15} /></button>
                            <button onClick={() => openAssign(d)} className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-lg" title="Assign Agent"><User size={15} /></button>
                            <button onClick={() => openLocation(d)} className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg" title="Update Location"><MapPin size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* View Modal */}
      <Modal isOpen={modalType === 'view'} onClose={() => setModalType(null)} title={`Delivery ${selected?.deliveryId}`} size="xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Delivery ID', selected.deliveryId],
                ['Parcel', (selected.parcelId as any)?.parcelId],
                ['Agent', (selected.deliveryAgentId as any)?.name || 'Unassigned'],
                ['Status', selected.status],
                ['Location', selected.currentLocation],
                ['ETA', selected.estimatedDeliveryDate ? format(new Date(selected.estimatedDeliveryDate), 'dd MMM yyyy') : 'N/A'],
                ['Notes', selected.deliveryNotes || 'None'],
                ['Last Updated', selected.lastUpdated ? format(new Date(selected.lastUpdated), 'dd MMM, HH:mm') : '—'],
              ].map(([k, v]) => <div key={k}><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="font-medium text-gray-800">{v || '—'}</p></div>)}
            </div>
            <DeliveryMap latitude={selected.latitude} longitude={selected.longitude} location={selected.currentLocation} height="250px" />
          </div>
        )}
      </Modal>

      {/* Assign Agent Modal */}
      <Modal isOpen={modalType === 'assign'} onClose={() => setModalType(null)} title="Assign Delivery Agent">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
            <select value={formData.deliveryAgentId || ''} onChange={(e) => setFormData({ ...formData, deliveryAgentId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select agent...</option>
              {agents.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModalType(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
            <button onClick={handleAssign} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Assign Agent</button>
          </div>
        </div>
      </Modal>

      {/* Update Location Modal */}
      <Modal isOpen={modalType === 'location'} onClose={() => setModalType(null)} title="Update Delivery Location">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
            <select value={formData.currentLocation || ''} onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
            <textarea value={formData.deliveryNotes || ''} onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Optional notes..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModalType(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
            <button onClick={handleLocation} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Update Location</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeliveriesPage;
