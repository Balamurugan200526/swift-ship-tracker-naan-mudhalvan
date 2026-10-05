import React, { useState, useEffect } from 'react';
import { Package, Search, MapPin } from 'lucide-react';
import { parcelAPI } from '../../services/api';
import { Parcel } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CustomerParcelsPage = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    parcelAPI.getAll({ status: statusFilter || undefined, limit: 50 })
      .then(r => { setParcels(r.data.parcels || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  const STATUSES = ['', 'Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Cancelled'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Parcels</h1>
        <p className="text-gray-500 text-sm">{parcels.length} parcels</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex gap-3">
        {STATUSES.map(s => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
          : parcels.length === 0 ? <EmptyState title="No parcels found" description="Your parcels will appear here once booked." />
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {parcels.map(p => {
                const delivery = p.deliveryId as any;
                const sender = p.senderId as any;
                const receiver = p.receiverId as any;
                return (
                  <div key={p._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-blue-600 text-lg">{p.parcelId}</p>
                        <p className="text-xs text-gray-400">{p.description || 'Package'} • {p.weight} kg</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                      {sender && <p><span className="text-gray-400">From:</span> {sender.name}</p>}
                      {receiver && <p><span className="text-gray-400">To:</span> {receiver.name}</p>}
                      {delivery?.currentLocation && (
                        <p className="flex items-center gap-1">
                          <MapPin size={12} className="text-blue-500" />{delivery.currentLocation}
                        </p>
                      )}
                      <p><span className="text-gray-400">ETA:</span> {format(new Date(p.estimatedDeliveryDate), 'dd MMM yyyy')}</p>
                    </div>
                    <Link to={`/track?id=${p.parcelId}`}
                      className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                      <MapPin size={14} /> Track Parcel
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
};

export default CustomerParcelsPage;
