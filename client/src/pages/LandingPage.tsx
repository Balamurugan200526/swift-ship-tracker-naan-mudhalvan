import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, MapPin, Bot, Shield, BarChart3, ArrowRight, CheckCircle, Zap, Clock, Users } from 'lucide-react';

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    {/* Nav */}
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">SwiftShip</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/track" className="text-gray-600 hover:text-blue-600 text-sm font-medium hidden sm:block">Track Parcel</Link>
          <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Get Started</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="pt-28 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Zap size={14} /> Powered by AI Tracking Technology
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Track Every Shipment.<br />
          <span className="text-blue-600">Deliver With Confidence.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          SwiftShip Tracker brings parcel booking, real-time delivery visibility, intelligent tracking,
          and customer communication into one powerful platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/track" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg">
            <MapPin size={20} /> Track a Shipment
          </Link>
          <Link to="/register" className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors text-lg">
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[['10K+', 'Parcels Delivered'], ['99%', 'On-Time Delivery'], ['500+', 'Cities Covered']].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{num}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything for Modern Logistics</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">A complete platform with real-time tracking, AI assistance, and powerful analytics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { Icon: MapPin,   title: 'Real-Time Tracking',      desc: 'Track parcels on interactive maps with live location and delivery timeline.', color: 'text-blue-600 bg-blue-100' },
            { Icon: Bot,      title: 'AI Assistant',             desc: 'Ask our AI to track parcels, check status, and get delivery updates instantly.', color: 'text-purple-600 bg-purple-100' },
            { Icon: BarChart3,title: 'Analytics Dashboard',      desc: 'Comprehensive insights on delivery performance and agent metrics.', color: 'text-green-600 bg-green-100' },
            { Icon: Shield,   title: 'Role-Based Security',      desc: 'Separate dashboards for admins, agents, customers, and support teams.', color: 'text-orange-600 bg-orange-100' },
            { Icon: Clock,    title: 'Instant Notifications',    desc: 'Automatic alerts when parcels are booked, in transit, or delivered.', color: 'text-red-600 bg-red-100' },
            { Icon: Users,    title: 'Multi-Role Management',    desc: 'Manage senders, receivers, customers, and delivery agents seamlessly.', color: 'text-indigo-600 bg-indigo-100' },
          ].map(({ Icon, title, desc, color }) => (
            <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How SwiftShip Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Book a Parcel', desc: 'Create a booking with sender, receiver, and parcel details. Get a unique Parcel ID (P-001) instantly.' },
            { step: '02', title: 'Track Real-Time', desc: 'Monitor your parcel on live maps with status updates at every step of the journey.' },
            { step: '03', title: 'Delivered!', desc: 'Get notified instantly when your parcel is delivered. View full delivery history.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* AI section */}
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"><Bot size={28} /></div>
        <h2 className="text-3xl font-bold mb-4">Meet SwiftShip AI</h2>
        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
          Our intelligent assistant tracks parcels, answers questions, and provides real-time updates.
          Just ask: "Track P-001" or "Where is my parcel?"
        </p>
        <div className="bg-white/10 rounded-2xl p-6 max-w-md mx-auto text-left">
          <div className="space-y-3">
            <div className="bg-white/20 rounded-xl p-3 text-sm ml-8">Track parcel P-001</div>
            <div className="bg-white rounded-xl p-3 text-sm text-gray-800">
              <strong>📦 P-001</strong> is currently <strong>In Transit</strong> via Chennai.
              Expected delivery: <strong>7 Oct 2026</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-500 mb-8">Join SwiftShip and experience modern parcel management.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">Create Account</Link>
          <Link to="/track" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">Track Parcel</Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><Zap size={14} className="text-white" /></div>
          <span className="font-semibold text-white">SwiftShip Tracker</span>
        </div>
        <p className="text-sm">© 2026 SwiftShip Tracker. Built for Naan Mudhalvan.</p>
        <div className="flex gap-4 text-sm">
          <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          <Link to="/track" className="hover:text-white transition-colors">Track</Link>
          <Link to="/register" className="hover:text-white transition-colors">Register</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
