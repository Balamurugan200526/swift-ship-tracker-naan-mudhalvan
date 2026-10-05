import React from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      {icon || <Package size={28} className="text-gray-400" />}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;
