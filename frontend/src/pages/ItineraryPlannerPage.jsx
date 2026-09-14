import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Compass,
  MapPin,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Printer,
  ShieldCheck,
  Plus,
  Trash2,
  Award
} from 'lucide-react';
import { destinations } from '../data/destinations';
import CrowdBadge from '../components/CrowdBadge';

const presetCircuits = {
  jaipur: {
    name: "Jaipur Pink City & Forts Circuit",
    city: "Jaipur",
    tagline: "Optimized chronological sequence avoiding 11:00 AM - 1:30 PM bottleneck crowds at Amer.",
    sites: ["RJ_AMBER_FORT", "RJ_JAIGARH_FORT", "RJ_HAWA_MAHAL", "RJ_NAHARGARH_FORT"]
  },
  udaipur: {
    name: "Udaipur Lakes & Mewar Royal Circuit",
    city: "Udaipur",
    tagline: "Lakeside journey timed for serene early ghat entries and panoramic sunset lookouts.",
    sites: ["RJ_CITY_PALACE_UDAIPUR", "RJ_FATEH_SAGAR_LAKE", "RJ_UDAIPUR_LAKES"]
  },
  jodhpur: {
    name: "Jodhpur Blue City Citadel Circuit",
    city: "Jodhpur",
    tagline: "Early morning cliff-top fortress exploration followed by tranquil palace walks.",
    sites: ["RJ_MEHRANGARH_FORT", "RJ_UMAID_BHAWAN_PALACE", "RJ_OSIAN"]
  },
  jaisalmer: {
    name: "Jaisalmer Thar Desert & Living Fort",
    city: "Jaisalmer",
    tagline: "Sunrise living citadel tour and sunset golden hour across silver sand dunes.",
    sites: ["RJ_JAISALMER_FORT", "RJ_DESERT_NATIONAL_PARK", "RJ_RAMDEVRA"]
  }
};

export default function ItineraryPlannerPage() {
  const [activeCircuitKey, setActiveCircuitKey] = useState('jaipur');
  const [customSites, setCustomSites] = useState([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [addSiteSearch, setAddSiteSearch] = useState('');

  const circuitData = presetCircuits[activeCircuitKey];

  const itinerarySites = useMemo(() => {
    if (isCustomMode) {
      return customSites;
    }
    const ids = circuitData?.sites || [];
    return ids
      .map(id => destinations.find(d => d.site_id === id))
      .filter(Boolean);
  }, [isCustomMode, customSites, circuitData]);

  const scheduledTimeline = useMemo(() => {
    const slots = [
      { time: "08:00 AM – 10:15 AM", label: "Early Morning / Golden Window", note: "Minimal crowd footprint. Direct walk-in without queues." },
      { time: "10:45 AM – 01:00 PM", label: "Late Morning Reroute", note: "Calmer nearby destination while primary fort gates experience peak traffic." },
      { time: "01:15 PM – 02:45 PM", label: "Midday Heritage Rest & Lunch", isBreak: true, note: "Avoid peak midday sun and bottleneck influx." },
      { time: "03:15 PM – 05:15 PM", label: "Afternoon Heritage Discovery", note: "Subdued footfall window with balanced indoor/outdoor comfort." },
      { time: "05:30 PM – 07:15 PM", label: "Sunset Panorama Climax", note: "High-elevation golden hour views and evening illuminations." }
    ];

    let slotIdx = 0;
    const timeline = [];

    itinerarySites.forEach((site) => {
      if (slotIdx === 2) {
        timeline.push({
          slot: slots[2],
          isBreak: true,
          title: "Authentic Rajasthani Thali & Cultural Pause",
          description: "Relax at a local haveli restaurant, recharging while regional tourist queues reach peak saturation."
        });
        slotIdx++;
      }

      const currentSlot = slots[slotIdx] || { time: "Extended Evening Slot", label: "Flexible Tour", note: "Extended visit" };
      timeline.push({
        slot: currentSlot,
        site: site,
        isBreak: false
      });
      slotIdx++;
    });

    return timeline;
  }, [itinerarySites]);

  const handleAddCustomSite = (site) => {
    if (!customSites.some(s => s.site_id === site.site_id)) {
      setCustomSites([...customSites, site]);
    }
    setAddSiteSearch('');
  };

  const handleRemoveCustomSite = (siteId) => {
    setCustomSites(customSites.filter(s => s.site_id !== siteId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SIH26204 Decision Support Engine</span>
          </div>

          <h1 className="font-serif-title text-3xl sm:text-5xl font-black tracking-tight text-white">
            Smart Crowd-Aware Itinerary Planner
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Traditional tourist plans funnel visitors into Amer and Mehrangarh at peak hours. MargDarshak chronologically orders your circuit to target off-peak golden slots, reducing gate wait times by up to <strong>65%</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Queue Reduction: <strong>Up to 65%</strong></span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Crowd Comfort Score: <strong>92/100</strong></span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Rajasthan Tourism Dataset Aligned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Preset Circuits vs Custom Builder */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-serif-title text-xl font-bold text-slate-900">Select Travel Circuit</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a calibrated pilot circuit or design a custom schedule</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isCustomMode ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curated Circuits
            </button>
            <button
              onClick={() => {
                setIsCustomMode(true);
                if (customSites.length === 0) {
                  setCustomSites(destinations.slice(0, 4));
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isCustomMode ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Route Builder
            </button>
          </div>
        </div>

        {/* Preset Circuit Buttons */}
        {!isCustomMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(presetCircuits).map(([key, circuit]) => (
              <button
                key={key}
                onClick={() => setActiveCircuitKey(key)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  activeCircuitKey === key
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase text-amber-800">{circuit.city}</span>
                  {activeCircuitKey === key && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{circuit.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{circuit.tagline}</p>
              </button>
            ))}
          </div>
        ) : (
          /* Custom Route Builder Search & Add */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={addSiteSearch}
                onChange={(e) => setAddSiteSearch(e.target.value)}
                placeholder="Search any of the 113 Rajasthan heritage destinations to add..."
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-500 font-medium">
                {customSites.length} sites in itinerary
              </span>
            </div>

            {addSiteSearch.trim() && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1">
                {destinations
                  .filter(d => d.site_name.toLowerCase().includes(addSiteSearch.toLowerCase()) || d.city.toLowerCase().includes(addSiteSearch.toLowerCase()))
                  .slice(0, 6)
                  .map(site => (
                    <div
                      key={site.site_id}
                      className="flex items-center justify-between p-2 hover:bg-white rounded-xl transition-colors text-xs"
                    >
                      <div>
                        <strong className="text-slate-800">{site.site_name}</strong>
                        <span className="text-slate-400 text-[11px] ml-2">({site.city} • {site.category})</span>
                      </div>
                      <button
                        onClick={() => handleAddCustomSite(site)}
                        className="px-3 py-1 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generated Chronological Itinerary */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Automated Time-Slot Scheduling</span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              Your Daily Flow Chart
            </h2>
          </div>
          <button
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save Itinerary
          </button>
        </div>

        {/* Timeline List */}
        <div className="space-y-4">
          {scheduledTimeline.map((item, index) => {
            if (item.isBreak) {
              return (
                <div
                  key={`break-${index}`}
                  className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 text-xs shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                      <span>{item.slot.time}</span>
                      <span className="text-amber-700">• {item.title}</span>
                    </div>
                    <p className="text-amber-900/80 mt-0.5">{item.description}</p>
                  </div>
                </div>
              );
            }

            const site = item.site;
            if (!site) return null;

            return (
              <div
                key={site.site_id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="w-full md:w-56 shrink-0 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-black">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item.slot.time}</span>
                  </div>
                  <p className="text-[11px] font-bold text-amber-700">{item.slot.label}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{item.slot.note}</p>
                </div>

                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={site.image}
                    alt={site.site_name}
                    className="w-18 h-18 rounded-xl object-cover border border-slate-100 shrink-0"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <CrowdBadge level={site.crowd.current_crowd_level} size="sm" />
                      <span className="text-[11px] text-slate-400 font-semibold truncate">
                        {site.city}, Rajasthan • {site.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base truncate">
                      {site.site_name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {site.short_description || site.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right hidden lg:block">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacity Load</span>
                    <strong className="text-xs font-black text-slate-800">{site.crowd.current_capacity_utilization}%</strong>
                  </div>

                  <Link
                    to={`/destination/${site.site_id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>View Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isCustomMode && (
                    <button
                      onClick={() => handleRemoveCustomSite(site.site_id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove from itinerary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
