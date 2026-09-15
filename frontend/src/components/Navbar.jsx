import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Search, ShieldCheck, Shield, MapPin, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & National/State Badging */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-title font-bold text-xl tracking-tight text-slate-900">
                  MargDarshak
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 ml-1">
                  SIH26204
                </span>
              </div>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Rajasthan Pilot
                </span>
                <p className="text-[11px] font-medium text-slate-500 tracking-tight">Crowd-Aware Tourism Platform</p>
              </div>
            </div>
          </Link>

          {/* Quick Search on Navbar (Desktop) */}
          <form onSubmit={handleQuickSubmit} className="hidden lg:flex items-center relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Amber Fort, Udaipur, Mehrangarh..."
              className="w-full bg-slate-100/90 text-xs text-slate-800 pl-9 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
            <Link to="/explore" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" /> Explore 110+ Sites
            </Link>
            <Link to="/itinerary" className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Smart Itinerary Planner
            </Link>
            <Link to="/authority" className="text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-600" /> Authority Command
            </Link>
            <Link to="/about" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Data Provenance
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleQuickSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Search destination or city..."
              className="w-full bg-slate-100 text-xs text-slate-800 pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </form>
          <div className="flex flex-col space-y-2 pt-2 text-xs font-bold text-slate-700">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-md hover:bg-slate-50 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-amber-600" /> Explore All Destinations
            </Link>
            <Link
              to="/itinerary"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" /> Smart Crowd-Aware Itinerary Planner
            </Link>
            <Link
              to="/explore?crowd=LOW"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-md bg-emerald-50 text-emerald-800 flex items-center gap-2"
            >
              🟢 Live Low-Crowd Sites
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-md hover:bg-slate-50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Data Provenance (SIH26204)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
