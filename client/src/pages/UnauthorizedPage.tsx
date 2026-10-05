import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  DELIVERY_AGENT: '/agent/dashboard',
  CUSTOMER: '/customer/dashboard',
  SUPPORT: '/support/dashboard',
};

const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const homeRoute = user ? ROLE_HOME[user.role] || '/' : '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX size={36} className="text-red-400" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Access Denied</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          You don't have permission to access this page.
          Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link
            to={homeRoute}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Home size={16} /> My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
