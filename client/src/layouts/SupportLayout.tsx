import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from '../components/NotificationCenter';

const SupportLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center"><Zap size={18} className="text-white" /></div>
            <div><p className="font-bold text-base">SwiftShip</p><p className="text-xs text-gray-400">Support Portal</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          <NavLink to="/support/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <LayoutDashboard size={17} />Dashboard
          </NavLink>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user?.name}</p><p className="text-xs text-gray-400">Support</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"><LogOut size={16} />Sign Out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <span className="font-semibold text-gray-900">Support Dashboard</span>
          <div className="flex items-center gap-3"><NotificationCenter /></div>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
};

export default SupportLayout;
