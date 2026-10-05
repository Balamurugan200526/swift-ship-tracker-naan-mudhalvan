import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Truck, Clock, MapPin, ArrowRight } from 'lucide-react';
import { parcelAPI } from '../../services/api';
import { Parcel } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}><Icon size={22} className={color} /></div>
    <div><p className="text-xs text-gray-500 font-medium">{label}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
  </div>
);

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parcelAPI.getAll({ limit: 20 }).then(r => { setParcels(r.data.parcels || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const byStatus = (s: string) => parcels.filter(p => p.status === s).length;
  const active = parcels.filter(p => !['Delivered', 'Cancelled'].includes(p.status)).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your shipments and manage parcels</p>
        </div>
        <Link to="/track" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
          <MapPin size={16} /> Track Parcel
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Parcels"     value={parcels.length} icon={Package}      color="text-blue-600"   bg="bg-blue-50" />
        <StatCard label="Active Shipments"  value={active}          icon={Truck}         color="text-orange-600" bg="bg-orange-50" />
        <StatCard label="Delivered"         value={byStatus('Delivered')} icon={CheckCircle} color="text-green-600"  bg="bg-green-50" />
        <StatCard label="Pending"           value={byStatus('Booked')}  icon={Clock}         color="text-yellow-600" bg="bg-yellow-50" />
      </div>

      {/* Quick Track */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <h2 className="font-bold text-lg mb-1">Track a Parcel</h2>
        <p className="text-green-100 text-sm mb-4">Enter your parcel ID to get real-time updates</p>
        <div className="flex gap-3 max-w-sm">
          <input
            className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Enter P-001..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/track?id=${(e.target as HTMLInputElement).value}`);
            }}
          />
          <button onClick={() => navigate('/track')} className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-green-50">
            Track <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Recent Parcels</h2>
          <Link to="/customer/parcels" className="text-sm text-green-600 font-medium hover:underline">View all →</Link>
        </div>
        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
          : parcels.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Package size={32} className="mx-auto mb-2 text-gray-200" />
              <p>No parcels yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Parcel ID', 'Sender', 'Status', 'ETA', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parcels.slice(0, 6).map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600">{p.parcelId}</td>
                      <td className="px-4 py-3 text-gray-700">{(p.senderId as any)?.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{format(new Date(p.estimatedDeliveryDate), 'dd MMM')}</td>
                      <td className="px-4 py-3">
                        <Link to={`/track?id=${p.parcelId}`} className="text-green-600 hover:underline text-xs font-medium">Track</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
