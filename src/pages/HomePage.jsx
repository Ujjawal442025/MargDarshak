import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingDown,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Clock,
  Users,
  Search,
  Compass
} from 'lucide-react';
import { destinations } from '../data/destinations';
import DestinationCard from '../components/DestinationCard';
import CrowdBadge from '../components/CrowdBadge';
import HeroSlider from '../components/HeroSlider';
import FestivalsSection from '../components/FestivalsSection';

export default function HomePage() {
  const navigate = useNavigate();

  const popularSites = destinations.slice(0, 6);
  const amberFort = destinations.find((d) => d.site_name.toLowerCase().includes('amber fort')) || destinations[2];
  const jaigarhFort = destinations.find((d) => d.site_name.toLowerCase().includes('jaigarh fort')) || destinations[25];
  const exploreCities = ['Jaipur', 'Jodhpur', 'Udaipur', 'Jaisalmer', 'Bundi', 'Chittorgarh', 'Kota', 'Sawai Madhopur'];

  return (
    <div className="space-y-20 pb-20">
      {/* JAPAN TRAVEL STYLE AUTO SLIDER HERO WITH QUICK SEARCH */}
      <HeroSlider />

      {/* CORE REDISTRIBUTION SHOWCASE (Avoid The Rush) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="text-amber-400 font-bold uppercase tracking-widest text-xs flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-4 h-4" /> Real-Time Crowd Redistribution Logic
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold">
              Avoid Overcrowded Sites. Discover Nearby Calm.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              When high visitor surges trigger bottleneck alerts, Rajasthan Darshan automatically calculates proximity and scores lower-density alternatives within direct travel radius.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* High crowd card */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-rose-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Searched Site (High Density)</span>
                <CrowdBadge level="HIGH" size="sm" />
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={amberFort.image}
                  alt={amberFort.site_name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-lg">{amberFort.site_name}</h3>
                  <p className="text-xs text-slate-400">{amberFort.city}, Rajasthan</p>
                  <p className="text-xs text-rose-300 font-semibold mt-1">
                    Wait Time: {amberFort.crowd.estimated_wait_time} • {amberFort.crowd.current_capacity_utilization}% Capacity
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                Heavy queues at Suraj Pol gate. Inflow exceeds nominal hourly throughput by 28%.
              </p>
            </div>

            {/* Smart alternative card */}
            <div className="bg-emerald-950/40 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/50 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Recommended Smart Alternative
                </span>
                <CrowdBadge level="LOW" size="sm" />
              </div>
              <div className="flex items-center gap-4">
                <img
                  src={jaigarhFort.image}
                  alt={jaigarhFort.site_name}
                  className="w-20 h-20 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-lg">{jaigarhFort.site_name}</h3>
                  <p className="text-xs text-emerald-300 font-medium">Just 2.4 km uphill via connected ridge</p>
                  <p className="text-xs text-emerald-200 font-semibold mt-1">
                    Wait Time: 0–5 mins • {jaigarhFort.crowd.current_capacity_utilization}% Capacity
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-emerald-200 font-medium">Visit Score: 91/100 (Exceptional)</span>
                <Link
                  to={`/destination/${jaigarhFort.site_id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Explore Jaigarh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAJASTHAN TOURISM OFFICIAL FESTIVAL CALENDAR SECTION */}
      
      {/* CROWD-AWARE ITINERARY PLANNER PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase font-black tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
              <Sparkles className="w-3 h-3 text-amber-200" /> New Smart Feature
            </span>
            <h2 className="font-serif-title text-2xl sm:text-4xl font-black">
              Plan Your Crowd-Optimized Daily Itinerary
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-normal">
              Don't visit Amber or Mehrangarh at peak 12:00 PM. Our algorithm chronologically orders your circuit by low-crowd golden slots, saving you hours in gate queues.
            </p>
          </div>
          <Link
            to="/itinerary"
            className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 group"
          >
            <span>Launch Itinerary Planner</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
          </Link>
        </div>
      </section>

      <FestivalsSection />

      {/* HOW IT WORKS (4 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">The Intelligent Decision Loop</span>
          <h2 className="font-serif-title text-3xl font-bold text-slate-900 mt-1">
            How Rajasthan Darshan Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A continuous closed-loop visitor distribution engine ensuring sustainable heritage conservation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Search Destination',
              desc: 'Look up any historic fort, haveli, wildlife safari, or sacred temple across 35 districts of Rajasthan.',
              icon: Search
            },
            {
              step: '02',
              title: 'Analyze Crowd Load',
              desc: 'View category-calibrated hourly ingress curves, gate wait times, and live capacity utilization.',
              icon: Users
            },
            {
              step: '03',
              title: 'Find Best Time',
              desc: 'Category-specific golden hours (Morning Safari, Temple Aarti off-peak, Sunset lake hours).',
              icon: Clock
            },
            {
              step: '04',
              title: 'Proximity Reroute',
              desc: 'Receive AI-ranked nearby alternatives if your primary choice is congested.',
              icon: Compass
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative hover:border-amber-400/80 transition-all">
                <span className="text-3xl font-black text-amber-500/20 absolute top-4 right-4">{item.step}</span>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR HERITAGE DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Heritage Directory</span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Top Rajasthan Landmarks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Official sites documented in the 2024-25 Rajasthan Tourism economic census
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            <span>Explore All 110+ Sites</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularSites.map((dest) => (
            <DestinationCard key={dest.site_id} destination={dest} />
          ))}
        </div>
      </section>

      {/* EXPLORE BY CITY CIRCUIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/60 rounded-3xl p-8 sm:p-10 border border-amber-200/80">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-slate-900">
              Explore by Historic Circuits
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Filter crowd density across key royal hubs in Rajasthan
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {exploreCities.map((city) => (
              <button
                key={city}
                onClick={() => navigate(`/explore?city=${city}`)}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-amber-600 hover:text-white border border-amber-200 font-semibold text-xs text-slate-800 transition-all shadow-xs"
              >
                {city} Circuit
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
