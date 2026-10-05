import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Truck, UserCheck, Package, RefreshCw } from 'lucide-react';
import { reportAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import StatusBadge from '../../components/StatusBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#22c55e', '#ef4444', '#6b7280'];

const ReportsPage = () => {
  const [overview, setOverview] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'parcels' | 'agents'>('overview');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, aRes, pRes] = await Promise.all([
        reportAPI.overview(), reportAPI.agents(), reportAPI.parcels()
      ]);
      setOverview(oRes.data);
      setAgents(aRes.data);
      setParcels(pRes.data);
    } catch { toast.error('Failed to load report data'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'parcels',  label: 'Parcels',  icon: Package },
    { id: 'agents',   label: 'Agents',   icon: UserCheck },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Comprehensive logistics performance data</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-lg hover:border-blue-300 transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          {tab === 'overview' && overview && (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Parcels', value: overview.totalParcels, icon: Package, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Delivered', value: overview.delivered, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
                  { label: 'In Transit', value: overview.inTransit, icon: Truck, color: 'bg-orange-50 text-orange-600' },
                  { label: 'Success Rate', value: `${overview.deliverySuccessRate}%`, icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><c.icon size={18} /></div>
                    <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={overview.statusDistribution?.filter((d: any) => d.count > 0)} cx="50%" cy="50%" outerRadius={80}
                        dataKey="count" nameKey="status" label={(entry: any) => `${entry.status || entry.name || ''} ${((entry.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                        {overview.statusDistribution?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Daily Shipments</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={overview.dailyShipments || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Parcels" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === 'parcels' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">All Parcels Report</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{['Parcel ID', 'Sender', 'Receiver', 'Weight', 'Status', 'ETA', 'Created'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {parcels.map((p: any) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">{p.parcelId}</td>
                        <td className="px-4 py-3 text-gray-700">{p.senderId?.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{p.receiverId?.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{p.weight} kg</td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-gray-500">{format(new Date(p.estimatedDeliveryDate), 'dd MMM yyyy')}</td>
                        <td className="px-4 py-3 text-gray-500">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'agents' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Agent Performance</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{['Agent', 'Email', 'Phone', 'Assigned', 'Delivered'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {agents.map((a: any) => (
                      <tr key={a.agentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                        <td className="px-4 py-3 text-gray-600">{a.email}</td>
                        <td className="px-4 py-3 text-gray-600">{a.phone || '—'}</td>
                        <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{a.assigned}</span></td>
                        <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">{a.delivered}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
