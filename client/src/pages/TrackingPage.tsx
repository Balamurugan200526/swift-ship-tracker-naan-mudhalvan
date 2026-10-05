import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Loader2, Zap, MapPin, Scale, Calendar, User, Truck } from 'lucide-react';
import { parcelAPI } from '../services/api';
import { Parcel, TrackingHistory, Delivery } from '../types';
import StatusBadge from '../components/StatusBadge';
import TrackingTimeline from '../components/TrackingTimeline';
import DeliveryMap from '../components/Map';
import { format } from 'date-fns';

const TrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [history, setHistory] = useState<TrackingHistory[]>([]);

  const trackParcel = async (id?: string) => {
    const trackId = (id || query).trim().toUpperCase();
    if (!trackId) return;
    setLoading(true);
    setError('');
    setParcel(null);
    setHistory([]);
    try {
      const { data } = await parcelAPI.track(trackId);
      setParcel(data.parcel);
      setHistory(data.history || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Parcel "${trackId}" not found. Please check the ID.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) { setQuery(id); trackParcel(id); }
  }, []);

  const delivery = parcel?.deliveryId as Delivery | undefined;
  const sender = parcel?.senderId as any;
  const receiver = parcel?.receiverId as any;
  const agent = delivery?.deliveryAgentId as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Zap size={16} className="text-white" /></div>
            <span className="font-bold text-gray-900">SwiftShip</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Track Your Shipment</h1>
          <p className="text-gray-500 mb-8">Enter your parcel ID to get real-time tracking information</p>
          <div className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && trackParcel()}
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="Enter Parcel ID (e.g. P-001)"
                />
              </div>
              <button
                onClick={() => trackParcel()}
                disabled={loading || !query.trim()}
                className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                Track
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Try: P-001, P-003, P-005, P-010</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
            <Package size={24} className="mx-auto mb-2 text-red-400" />
            {error}
          </div>
        )}

        {/* Results */}
        {parcel && (
          <div className="space-y-6">
            {/* Status banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{parcel.parcelId}</h2>
                    <StatusBadge status={parcel.status} size="lg" />
                  </div>
                  {delivery && (
                    <p className="text-gray-500 flex items-center gap-1 text-sm">
                      <MapPin size={14} className="text-blue-500" />
                      Currently at: <span className="font-medium text-gray-700 ml-1">{delivery.currentLocation}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Estimated Delivery</p>
                  <p className="text-lg font-bold text-gray-900">{format(new Date(parcel.estimatedDeliveryDate), 'dd MMM yyyy')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parcel Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package size={16} />Parcel Details</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Parcel ID', value: parcel.parcelId, Icon: Package },
                    { label: 'Weight', value: `${parcel.weight} kg`, Icon: Scale },
                    { label: 'Description', value: parcel.description || 'N/A', Icon: Package },
                    { label: 'Sender', value: sender?.name, Icon: User },
                    { label: 'Receiver', value: receiver?.name, Icon: User },
                    { label: 'Delivery Address', value: receiver?.address, Icon: MapPin },
                  ].filter(item => item.value).map(({ label, value, Icon }) => (
                    <div key={label} className="flex items-start gap-3 text-sm">
                      <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">{label}</p>
                        <p className="font-medium text-gray-800">{value}</p>
                      </div>
                    </div>
                  ))}
                  {agent && (
                    <div className="flex items-start gap-3 text-sm">
                      <Truck size={15} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-xs">Delivery Agent</p>
                        <p className="font-medium text-gray-800">{agent.name}</p>
                        {agent.phone && <p className="text-gray-500 text-xs">{agent.phone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={16} />Tracking Timeline</h3>
                <TrackingTimeline currentStatus={parcel.status} history={history} />
              </div>
            </div>

            {/* Map */}
            {delivery && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={16} />
                  Current Location
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Simulated</span>
                </h3>
                <DeliveryMap
                  latitude={delivery.latitude || 13.0827}
                  longitude={delivery.longitude || 80.2707}
                  location={delivery.currentLocation}
                  height="320px"
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Location data is updated when the delivery agent updates the parcel status.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty / default state */}
        {!parcel && !error && !loading && (
          <div className="text-center py-12 text-gray-400">
            <Package size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-medium text-gray-500">Enter a parcel ID above to track your shipment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
