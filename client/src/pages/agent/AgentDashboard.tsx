import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Navigation, Clock } from 'lucide-react';
import { deliveryAPI } from '../../services/api';
import { Delivery } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}><Icon size={22} className={color} /></div>
    <div><p className="text-xs text-gray-500 font-medium">{label}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
  </div>
);

const AgentDashboard = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryAPI.getAll().then(r => { setDeliveries(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const byStatus = (s: string) => deliveries.filter(d => (d.parcelId as any)?.status === s || d.status === s).length;
  const today = deliveries.filter(d => {
    const updated = d.lastUpdated ? new Date(d.lastUpdated).toDateString() : '';
    return updated === new Date().toDateString();
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Here's your delivery overview for today</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Assigned" value={deliveries.length} icon={Package} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Today's Deliveries" value={today} icon={Clock} color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard label="In Transit" value={byStatus('In Transit')} icon={Truck} color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Out for Delivery" value={byStatus('Out for Delivery')} icon={Navigation} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Assignments</h2>
        </div>
        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
          : deliveries.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Truck size={32} className="mx-auto mb-2 text-gray-200" />
              <p>No deliveries assigned yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Delivery ID', 'Parcel', 'Receiver', 'Location', 'Status', 'Updated'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deliveries.slice(0, 8).map(d => {
                    const parcel = d.parcelId as any;
                    const receiver = parcel?.receiverId;
                    return (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-semibold text-orange-600">{d.deliveryId}</td>
                        <td className="px-4 py-3 font-mono text-blue-600">{parcel?.parcelId || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{receiver?.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{d.currentLocation || '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={parcel?.status || d.status} /></td>
                        <td className="px-4 py-3 text-gray-500">{d.lastUpdated ? format(new Date(d.lastUpdated), 'dd MMM, HH:mm') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default AgentDashboard;
