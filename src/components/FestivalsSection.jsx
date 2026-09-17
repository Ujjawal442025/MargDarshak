import React, { useState } from 'react';
import { Calendar, MapPin, Sparkles, Flame, ArrowRight } from 'lucide-react';
import { rajasthanEvents } from '../data/events';
import { useNavigate } from 'react-router-dom';

export default function FestivalsSection() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [activeLocation, setActiveLocation] = useState('ALL');

  const filteredEvents = rajasthanEvents.filter(evt => {
    if (selectedYear !== 'ALL' && evt.year.toString() !== selectedYear) return false;
    if (activeLocation !== 'ALL' && !evt.location.toLowerCase().includes(activeLocation.toLowerCase())) return false;
    return true;
  });

  const popularLocations = ['ALL', 'Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Bikaner', 'Bundi', 'Kota'];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            Official Tourism Events & Cultural Fairs (2024–2025)
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-black text-slate-900">
            Rajasthan Cultural Fairs & Festival Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Sourced from the Department of Tourism official calendar. These high-density cultural periods feature integrated crowd surge warnings for regional circuit planning.
          </p>
        </div>

        {/* Year Filter Pill */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          {['ALL', '2024', '2025'].map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {yr === 'ALL' ? 'All Editions' : `${yr} Calendar`}
            </button>
          ))}
        </div>
      </div>

      {/* City Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 shrink-0">Filter Circuit:</span>
        {popularLocations.map(loc => (
          <button
            key={loc}
            onClick={() => setActiveLocation(loc)}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all border ${
              activeLocation === loc
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            {loc === 'ALL' ? 'All Cities' : loc}
          </button>
        ))}
      </div>

      {/* Grid of Festivals with Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-2xl hover:border-amber-500/80 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Visual Cover Photo with Overlay */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
              <img
                src={evt.image}
                alt={evt.event_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1000&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"></div>

              {/* Badges on image */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-white/20">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {evt.year} Edition
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${
                  evt.surge_level === 'VERY HIGH'
                    ? 'bg-rose-500/95 text-white border-rose-400'
                    : 'bg-amber-500/95 text-slate-950 border-amber-400'
                }`}>
                  {evt.surge_level} SURGE
                </span>
              </div>

              {/* Overlay Location & Date */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-300">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{evt.location}, Rajasthan</span>
                </div>
                <h3 className="font-serif-title text-xl font-bold text-white tracking-wide mt-0.5 line-clamp-1">
                  {evt.event_name}
                </h3>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between py-1.5 px-2.5 bg-amber-50/80 rounded-xl border border-amber-200/70 text-xs mb-2.5">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>{evt.date_range}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded">
                    Peak Influx
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {evt.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Official Tourism Data</span>
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(evt.location.split('/')[0])}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 group/btn transition-colors"
                >
                  <span>Explore {evt.location.split('/')[0]} Sites</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
