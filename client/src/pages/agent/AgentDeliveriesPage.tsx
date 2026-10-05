import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Truck, Navigation, Loader2 } from 'lucide-react';
import { deliveryAPI, parcelAPI } from '../../services/api';
import { Delivery } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import DeliveryMap from '../../components/Map';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LOCATIONS = ['Warehouse', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Thanjavur', 'Mayiladuthurai', 'Vellore', 'Erode'];

const AgentDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<{ delivery: Delivery; status: string } | null>(null);
  const [locationForm, setLocationForm] = useState({ currentLocation: '', deliveryNotes: '' });
  const [updating, setUpdating] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const { data } = await deliveryAPI.getAll();
      setDeliveries(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const openDetail = (d: Delivery) => {
    setSelected(d);
    setLocationForm({ currentLocation: d.currentLocation || '', deliveryNotes: d.deliveryNotes || '' });
    setModalOpen(true);
  };

  const updateStatus = async (delivery: Delivery, status: string) => {
    setUpdating(true);
    try {
      const parcel = delivery.parcelId as any;
      await parcelAPI.updateStatus(parcel._id, { status, location: delivery.currentLocation, notes: `Status updated to ${status} by agent` });
      toast.success(`Parcel marked as ${status}!`);
      fetchDeliveries();
      setModalOpen(false);
    } catch { toast.error('Failed to update status'); }
    setUpdating(false);
    setConfirmStatus(null);
  };

  const updateLocation = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      await deliveryAPI.updateLocation(selected._id, locationForm);
      toast.success('Location updated!');
      fetchDeliveries();
      setModalOpen(false);
    } catch { toast.error('Failed to update location'); }
    setUpdating(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
        <p className="text-gray-500 text-sm">{deliveries.length} delivery assignments</p>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
        : deliveries.length === 0 ? <EmptyState title="No deliveries assigned" description="You have no delivery assignments yet." />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {deliveries.map(d => {
              const parcel = d.parcelId as any;
              const receiver = parcel?.receiverId;
              const status = parcel?.status || d.status;
              return (
                <div key={d._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-bold text-orange-600 text-lg">{d.deliveryId}</p>
                      <p className="font-mono text-blue-600 text-sm">{parcel?.parcelId}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="space-y-1.5 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={13} className="text-blue-500" />{d.currentLocation || 'Warehouse'}
                    </div>
                    {receiver && <p className="text-gray-600"><span className="text-gray-400">To:</span> {receiver.name}</p>}
                    {receiver?.address && <p className="text-gray-500 text-xs truncate">{receiver.address}</p>}
                    {d.estimatedDeliveryDate && (
                      <p className="text-gray-500 text-xs">ETA: {format(new Date(d.estimatedDeliveryDate), 'dd MMM yyyy')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {status === 'Booked' && (
                      <button onClick={() => setConfirmStatus({ delivery: d, status: 'In Transit' })}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2">
                        <Truck size={15} /> Start Delivery
                      </button>
                    )}
                    {status === 'In Transit' && (
                      <button onClick={() => setConfirmStatus({ delivery: d, status: 'Out for Delivery' })}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 flex items-center justify-center gap-2">
                        <Navigation size={15} /> Out for Delivery
                      </button>
                    )}
                    {status === 'Out for Delivery' && (
                      <button onClick={() => setConfirmStatus({ delivery: d, status: 'Delivered' })}
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                        <CheckCircle size={15} /> Mark Delivered
                      </button>
                    )}
                    <button onClick={() => openDetail(d)}
                      className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                      <MapPin size={15} /> Update Location
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Detail / Location Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Update ${selected?.deliveryId}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <DeliveryMap latitude={selected.latitude} longitude={selected.longitude} location={selected.currentLocation} height="220px" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
              <select value={locationForm.currentLocation} onChange={(e) => setLocationForm(f => ({ ...f, currentLocation: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
              <textarea value={locationForm.deliveryNotes} onChange={(e) => setLocationForm(f => ({ ...f, deliveryNotes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Optional notes..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">Cancel</button>
              <button onClick={updateLocation} disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                {updating ? <><Loader2 size={14} className="animate-spin" />Updating...</> : 'Update Location'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Status */}
      <ConfirmDialog
        isOpen={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        onConfirm={() => confirmStatus && updateStatus(confirmStatus.delivery, confirmStatus.status)}
        title={`Mark as ${confirmStatus?.status}`}
        message={`Are you sure you want to mark this parcel as "${confirmStatus?.status}"? This action will update the parcel status and notify the customer.`}
        confirmText={`Mark ${confirmStatus?.status}`}
        isDangerous={confirmStatus?.status === 'Delivered'}
      />
    </div>
  );
};

export default AgentDeliveriesPage;
