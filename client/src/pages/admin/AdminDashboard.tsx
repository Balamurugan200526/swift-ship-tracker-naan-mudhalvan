import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, AlertTriangle, Clock, Navigation, Users, UserCheck, TrendingUp, RefreshCw } from 'lucide-react';
import { reportAPI } from '../../services/api';
import { DashboardStats, Parcel } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  Booked: '#3b82f6', 'In Transit': '#f97316', 'Out for Delivery': '#8b5cf6',
  Delivered: '#22c55e', Delayed: '#ef4444', Cancelled: '#6b7280',
};

const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await reportAPI.overview();
      setStats(data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Parcels',      value: stats?.totalParcels,      icon: Package,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Booked',             value: stats?.booked,            icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'In Transit',         value: stats?.inTransit,         icon: Truck,       color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Out for Delivery',   value: stats?.outForDelivery,    icon: Navigation,  color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Delivered',          value: stats?.delivered,         icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Delayed',            value: stats?.delayed,           icon: AlertTriangle,color:'text-red-600',    bg: 'bg-red-50' },
    { label: 'Total Customers',    value: stats?.totalCustomers,    icon: Users,       color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Agents',      value: stats?.totalAgents,       icon: UserCheck,   color: 'text-teal-600',   bg: 'bg-teal-50' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time overview of SwiftShip operations</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-lg hover:border-blue-300 transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Success Rate */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white flex items-center justify-between">
        <div>
          <p className="text-green-100 text-sm font-medium">Delivery Success Rate</p>
          <p className="text-4xl font-bold mt-1">{stats?.deliverySuccessRate ?? 0}%</p>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <TrendingUp size={28} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={stats?.statusDistribution?.filter(d => d.count > 0)}
                cx="50%" cy="50%" outerRadius={85}
                dataKey="count" nameKey="status" label={(entry: any) => `${entry.status || entry.name || ''} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats?.statusDistribution?.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Shipments (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.dailyShipments || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Parcels" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Shipments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Parcel ID', 'Sender', 'Receiver', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats?.recentParcels || []).map((p: Parcel) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-600">{p.parcelId}</td>
                  <td className="px-4 py-3 text-gray-700">{(p.senderId as any)?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{(p.receiverId as any)?.name || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
