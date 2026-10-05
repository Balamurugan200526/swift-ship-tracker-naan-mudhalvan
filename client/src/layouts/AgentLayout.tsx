import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from '../components/NotificationCenter';

const navItems = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: '/agent/dashboard' },
  { label: 'My Deliveries', icon: Truck,            href: '/agent/deliveries' },
];

const AgentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 flex-shrink-0`}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center"><Zap size={18} className="text-white" /></div>
            <div><p className="font-bold text-base">SwiftShip</p><p className="text-xs text-gray-400">Delivery Agent</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <item.icon size={17} />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{user?.name}</p><p className="text-xs text-gray-400">Delivery Agent</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"><LogOut size={16} />Sign Out</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100"><Menu size={20} /></button>
            <span className="font-semibold text-gray-900 hidden md:block">Agent Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
};

export default AgentLayout;
