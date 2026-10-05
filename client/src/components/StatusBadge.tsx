import React from 'react';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  'Booked':           { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  'In Transit':       { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  'Out for Delivery': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  'Delivered':        { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  'Delayed':          { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
  'Cancelled':        { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  'Pending':          { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
      ? 'px-4 py-2 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${config.bg} ${config.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
