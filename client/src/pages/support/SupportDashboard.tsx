import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, BarChart3 } from 'lucide-react';
import { reportAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { format } from 'date-fns';

const SupportDashboard = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.overview().then(r => { setOverview(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="text-gray-500 text-sm">Read-only system overview</p>
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Parcels', value: overview?.totalParcels, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'In Transit', value: overview?.inTransit, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Delivered', value: overview?.delivered, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Success Rate', value: `${overview?.deliverySuccessRate}%`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg}`}><c.icon size={22} className={c.color} /></div>
                <div><p className="text-xs text-gray-500 font-medium">{c.label}</p><p className="text-2xl font-bold text-gray-900">{c.value}</p></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Recent Shipments</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Parcel ID', 'Sender', 'Receiver', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(overview?.recentParcels || []).map((p: any) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600">{p.parcelId}</td>
                      <td className="px-4 py-3 text-gray-700">{p.senderId?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{p.receiverId?.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportDashboard;
