import React from 'react';
import { CheckCircle, Package, Truck, Navigation, Home } from 'lucide-react';
import { TrackingHistory } from '../types';
import { format } from 'date-fns';

const STEPS = [
  { status: 'Booked',           label: 'Parcel Booked',      Icon: Package,    desc: 'Parcel received at warehouse' },
  { status: 'In Transit',       label: 'In Transit',          Icon: Truck,      desc: 'Parcel is on the way' },
  { status: 'Out for Delivery', label: 'Out for Delivery',    Icon: Navigation, desc: 'Out for delivery to your address' },
  { status: 'Delivered',        label: 'Delivered',           Icon: Home,       desc: 'Parcel delivered successfully' },
];

const STATUS_ORDER = ['Booked', 'In Transit', 'Out for Delivery', 'Delivered'];

interface TrackingTimelineProps {
  currentStatus: string;
  history: TrackingHistory[];
}

const TrackingTimeline = ({ currentStatus, history }: TrackingTimelineProps) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isDelayed = currentStatus === 'Delayed';
  const isCancelled = currentStatus === 'Cancelled';

  return (
    <div className="space-y-0">
      {STEPS.map((step, index) => {
        const histEntry = history.find(h => h.status === step.status);
        const isCompleted = currentIndex > index || currentStatus === step.status;
        const isCurrent = currentStatus === step.status;
        const isLast = index === STEPS.length - 1;
        const { Icon } = step;

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 ${
                isCompleted
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white border-gray-200 text-gray-300'
              }`}>
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-8 my-1 transition-all duration-300 ${
                  isCompleted && currentIndex > index ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {histEntry && (
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(histEntry.timestamp), 'dd MMM, HH:mm')}
                  </p>
                )}
              </div>
              <p className={`text-sm mt-0.5 ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                {histEntry?.description || step.desc}
              </p>
              {histEntry?.location && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <span>📍</span>
                  {histEntry.location}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {(isDelayed || isCancelled) && (
        <div className={`mt-2 p-3 rounded-lg border ${isDelayed ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-sm font-medium ${isDelayed ? 'text-red-700' : 'text-gray-600'}`}>
            {isDelayed ? '⚠️ This parcel is experiencing a delay. We apologize for any inconvenience.' : '❌ This parcel has been cancelled.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;
