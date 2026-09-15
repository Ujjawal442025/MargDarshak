import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Users,
  Compass,
  TrendingUp,
  Clock,
  ArrowRight,
  Sliders,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  RefreshCw,
  Zap,
  Filter,
  Layers,
  ChevronRight,
  Search,
  Check,
  BarChart3,
  X,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { destinations as rawDestinations } from '../data/destinations';
import { authorityKPIs, initialIncidents } from '../data/authorityData';
import SatelliteMapView from '../components/SatelliteMapView';

export default function AuthorityCommandCenter() {
  // 1. Dynamic Destination Data in state (Changes when surveys, interventions, or updates happen!)
  const [destinations, setDestinations] = useState(rawDestinations);
  const [selectedSiteId, setSelectedSiteId] = useState("RJ_AMBER_FORT");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [mapLayer, setMapLayer] = useState("satellite"); // satellite, topo, osm
  const [mapFilter, setMapFilter] = useState("ALL"); // ALL, CRITICAL, HIGH, MODERATE, LOW
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [filterModalCategory, setFilterModalCategory] = useState(null); // When clicking a KPI card, opens drill-down modal!
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  
  // What-if Simulation Parameters
  const [simParams, setSimParams] = useState({
    gateClosure: true,
    inflowMultiplier: 1.25,
    weatherRain: false
  });

  // Action Center Checkboxes
  const [actionFlags, setActionFlags] = useState({
    redirectTourists: true,
    deployPersonnel: true,
    monitorGate: true,
    issueAlert: false
  });

  // Survey update form state
  const [surveyData, setSurveyData] = useState({
    newCapacityPct: 70,
    crowdLevel: "HIGH",
    waitMinutes: 25,
    officerNotes: "Suraj Pol turnstiles experiencing high volume due to group arrivals."
  });

  // Real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Currently selected destination
  const selectedDest = useMemo(() => {
    return destinations.find(d => d.site_id === selectedSiteId) || destinations[0];
  }, [destinations, selectedSiteId]);

  // Dynamic calculation of KPIs from active state
  const dynamicKPIs = useMemo(() => {
    let crit = 0;
    let high = 0;
    let mod = 0;
    let low = 0;
    destinations.forEach(d => {
      const cap = d.crowd?.current_capacity_utilization || 50;
      const lvl = d.crowd?.current_crowd_level || 'MODERATE';
      if (lvl === 'CRITICAL' || cap >= 88) crit++;
      else if (lvl === 'HIGH' || cap >= 75) high++;
      else if (lvl === 'MODERATE' || cap >= 50) mod++;
      else low++;
    });
    return {
      total: destinations.length,
      critical: crit,
      high: high,
      moderate: mod,
      low: low,
      activeIncidents: 6,
      activeEvents: 12
    };
  }, [destinations]);

  // Hourly curve data formatted for Recharts
  const hourlyChartData = useMemo(() => {
    if (!selectedDest?.hourly_crowd_data) return [];
    return selectedDest.hourly_crowd_data.map(h => ({
      time: h.time.replace(':00 ', ' '),
      visitors: h.estimated_visitors,
      crowdPct: h.crowd_percentage
    }));
  }, [selectedDest]);

  // Predictive 15m, 30m, 45m, 60m data for Recharts Bar
  const predictiveBarData = useMemo(() => {
    const current = selectedDest.crowd?.current_capacity_utilization || 75;
    return [
      { interval: "Now", load: current, color: current >= 85 ? '#EF4444' : (current >= 70 ? '#F97316' : '#10B981') },
      { interval: "+15m", load: Math.min(100, Math.round(current * 1.06)), color: '#F97316' },
      { interval: "+30m", load: Math.min(100, Math.round(current * 1.14)), color: '#EF4444' },
      { interval: "+45m", load: Math.min(100, Math.round(current * 1.11)), color: '#EF4444' },
      { interval: "+60m", load: Math.max(30, Math.round(current * 0.94)), color: '#3B82F6' },
    ];
  }, [selectedDest]);

  // Execute tactical intervention: UPDATES LIVE DATA IN STATE!
  const handleExecuteInterventions = () => {
    setDestinations(prev => prev.map(d => {
      if (d.site_id === selectedSiteId) {
        // Applying tactical actions reduces capacity utilization and wait time
        const currentCap = d.crowd?.current_capacity_utilization || 80;
        const newCap = Math.max(45, Math.round(currentCap * 0.78)); // -22% reduction
        return {
          ...d,
          crowd: {
            ...d.crowd,
            current_capacity_utilization: newCap,
            current_crowd_level: newCap >= 85 ? 'CRITICAL' : (newCap >= 75 ? 'HIGH' : (newCap >= 50 ? 'MODERATE' : 'LOW')),
            estimated_wait_time: "5–10 mins (Traffic Diverted)"
          }
        };
      }
      return d;
    }));

    setActionSuccessMsg(`Action Dispatched! Redirected 30% flow to Gate 2 bypass. Real-time pressure at ${selectedDest.site_name} dropped.`);
    setTimeout(() => setActionSuccessMsg(""), 5000);
  };

  // Handle Field Survey / Live Ingress Telemetry Submission
  const handleSurveySubmit = (e) => {
    e.preventDefault();
    setDestinations(prev => prev.map(d => {
      if (d.site_id === selectedSiteId) {
        return {
          ...d,
          crowd: {
            ...d.crowd,
            current_capacity_utilization: Number(surveyData.newCapacityPct),
            current_crowd_level: surveyData.crowdLevel,
            estimated_wait_time: `${surveyData.waitMinutes} mins`
          }
        };
      }
      return d;
    }));
    setSurveyModalOpen(false);
    setActionSuccessMsg(`Live Ground Telemetry for ${selectedDest.site_name} updated successfully.`);
    setTimeout(() => setActionSuccessMsg(""), 5000);
  };

  // Filter list of destinations for Drill-Down Modal
  const modalFilteredList = useMemo(() => {
    if (!filterModalCategory) return [];
    if (filterModalCategory === 'CRITICAL') {
      return destinations.filter(d => d.crowd?.current_crowd_level === 'CRITICAL' || d.crowd?.current_capacity_utilization >= 85);
    }
    if (filterModalCategory === 'HIGH') {
      return destinations.filter(d => d.crowd?.current_crowd_level === 'HIGH' || (d.crowd?.current_capacity_utilization >= 75 && d.crowd?.current_capacity_utilization < 85));
    }
    if (filterModalCategory === 'MODERATE') {
      return destinations.filter(d => d.crowd?.current_crowd_level === 'MODERATE');
    }
    if (filterModalCategory === 'LOW') {
      return destinations.filter(d => d.crowd?.current_crowd_level === 'LOW');
    }
    return destinations;
  }, [destinations, filterModalCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* Top Professional Header Bar (Clean White Background) */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-black">
              <Shield className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                  Government of Rajasthan • Department of Tourism
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Telemetry Active
                </span>
              </div>
              <h1 className="font-serif-title text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                MargDarshak — Rajasthan Tourism Intelligence Authority Command Center
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                  SIH26204
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <div className="bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-medium">
              Time: <strong className="text-slate-900 font-mono">{currentTime}</strong>
            </div>
            <button
              onClick={() => {
                setSurveyData({
                  newCapacityPct: selectedDest.crowd?.current_capacity_utilization || 75,
                  crowdLevel: selectedDest.crowd?.current_crowd_level || "HIGH",
                  waitMinutes: 20,
                  officerNotes: "Survey logged at gate terminal."
                });
                setSurveyModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Log Ground Survey</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Live Updated</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* INTERACTIVE KPI STRIP (CLICKABLE! Shows all details in a modal when clicked) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              State Telemetry Summary (Click any card to inspect all matching destinations)
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">Interactive Drill-down</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Destinations */}
            <div
              onClick={() => setFilterModalCategory('ALL')}
              className="bg-white border border-slate-200/90 hover:border-slate-400 rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:shadow-md group"
            >
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Monitored</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">{dynamicKPIs.total}</span>
                <span className="text-[10px] text-slate-500">Sites</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-amber-700">
                <span>View Full Register</span> <ChevronRight className="w-3 h-3" />
              </p>
            </div>

            {/* Critical Crowd KPI */}
            <div
              onClick={() => setFilterModalCategory('CRITICAL')}
              className="bg-white border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:shadow-md group bg-rose-50/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Critical Surge</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-rose-600 font-mono">{dynamicKPIs.critical}</span>
                <span className="text-[10px] text-rose-800 font-semibold">&gt;85% Cap</span>
              </div>
              <p className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                <span>Inspect Breaches</span> <ChevronRight className="w-3 h-3" />
              </p>
            </div>

            {/* High Crowd KPI */}
            <div
              onClick={() => setFilterModalCategory('HIGH')}
              className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:shadow-md group bg-orange-50/20"
            >
              <span className="text-[10px] uppercase font-bold text-orange-700 block">High Density</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-orange-600 font-mono">{dynamicKPIs.high}</span>
                <span className="text-[10px] text-orange-800 font-semibold">75-85%</span>
              </div>
              <p className="text-[10px] text-orange-600 font-bold mt-1 flex items-center gap-1">
                <span>Inspect High Sites</span> <ChevronRight className="w-3 h-3" />
              </p>
            </div>

            {/* Moderate Crowd */}
            <div
              onClick={() => setFilterModalCategory('MODERATE')}
              className="bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:shadow-md group"
            >
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Moderate Load</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600 font-mono">{dynamicKPIs.moderate}</span>
                <span className="text-[10px] text-slate-500">50-75%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-amber-700">
                <span>Inspect Moderate</span> <ChevronRight className="w-3 h-3" />
              </p>
            </div>

            {/* Active Festivals */}
            <div
              className="bg-white border border-blue-200/90 rounded-2xl p-4 shadow-xs"
            >
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Active Events</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-blue-600 font-mono">{dynamicKPIs.activeEvents}</span>
                <span className="text-[10px] text-slate-500">Fairs / Mela</span>
              </div>
              <p className="text-[10px] text-blue-700 mt-1">Pushkar, Desert Festival</p>
            </div>

            {/* Active Incidents */}
            <div
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
            >
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Field Incidents</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">{dynamicKPIs.activeIncidents}</span>
                <span className="text-[10px] text-slate-500">Tracked</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Turnstiles &amp; Gate Marshals</p>
            </div>
          </div>
        </div>

        {/* MAIN COMMAND WORKSPACE: Satellite GIS Map + Choke-point Intelligence + Recharts Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLS: Real Satellite Map & Hourly Chart */}
          <div className="lg:col-span-8 space-y-6">
            {/* Map Container */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
                    Geospatial GIS Surveillance
                  </span>
                  <h2 className="font-serif-title text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-600" />
                    Live Rajasthan Satellite Telemetry Grid
                  </h2>
                </div>

                {/* Filter Map Markers */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setMapFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        mapFilter === lvl
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Satellite Map Component using Leaflet Real Satellite Imagery */}
              <div className="h-[440px] w-full">
                <SatelliteMapView
                  destinations={destinations}
                  selectedSiteId={selectedSiteId}
                  onSelectSite={(id) => setSelectedSiteId(id)}
                  mapFilter={mapFilter}
                  mapLayer={mapLayer}
                  setMapLayer={setMapLayer}
                />
              </div>

              {/* Selected Destination Quick Header Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Active Focal Point:</span>
                  <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                    {selectedDest.site_name} ({selectedDest.city})
                  </strong>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    selectedDest.crowd?.current_crowd_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedDest.crowd?.current_crowd_level} • {selectedDest.crowd?.current_capacity_utilization}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSurveyData({
                        newCapacityPct: selectedDest.crowd?.current_capacity_utilization || 75,
                        crowdLevel: selectedDest.crowd?.current_crowd_level || "HIGH",
                        waitMinutes: 20,
                        officerNotes: "Survey logged at gate terminal."
                      });
                      setSurveyModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 text-xs transition-colors"
                  >
                    Edit Ground Data
                  </button>
                  <button
                    onClick={handleExecuteInterventions}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Deploy Rerouting</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CHARTS FOR REPRESENTATION BY RECHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart 1: Hourly Recharts Area Chart */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recharts Representation</span>
                    <h3 className="font-bold text-slate-900 text-sm">Hourly Ingress Pattern (8 AM – 8 PM)</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Max: {selectedDest.crowd?.total_daily_capacity?.toLocaleString()} Cap
                  </span>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rechartsCrowd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C59A45" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#C59A45" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="crowdPct" stroke="#B45309" strokeWidth={2.5} fill="url(#rechartsCrowd)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Predictive Horizon (+15m, +30m, +45m, +60m) Bar Chart */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">AI Ingress Horizon</span>
                    <h3 className="font-bold text-slate-900 text-sm">60-Min Inflow Pressure Forecast</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">Confidence: 89%</span>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={predictiveBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="interval" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        formatter={(val) => [`${val}% Capacity`, 'Predicted Load']}
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                      />
                      <Bar dataKey="load" radius={[6, 6, 0, 0]}>
                        {predictiveBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: Tactical Copilot & Real-Time Action Center */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Operations Copilot */}
            <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">AI Operations Copilot</h3>
                    <p className="text-[10px] text-slate-500">Autonomous Choke-point Recommendations</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Tactical Active
                </span>
              </div>

              {/* Threshold Banner */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Threshold Risk: {selectedDest.site_name}</span>
                </div>
                <p className="text-rose-950 text-[11px] leading-relaxed">
                  Turnstiles projected to reach <strong>94% capacity</strong> within 25 minutes. Rerouting is strongly advised.
                </p>
              </div>

              {/* Action Checkboxes */}
              <div className="space-y-2 text-xs text-slate-700">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={actionFlags.redirectTourists}
                    onChange={(e) => setActionFlags({ ...actionFlags, redirectTourists: e.target.checked })}
                    className="rounded accent-amber-600 w-4 h-4"
                  />
                  <span>Reroute 30% flow to Gate 2 bypass</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={actionFlags.deployPersonnel}
                    onChange={(e) => setActionFlags({ ...actionFlags, deployPersonnel: e.target.checked })}
                    className="rounded accent-amber-600 w-4 h-4"
                  />
                  <span>Deploy 3 perimeter marshals from Jaigarh</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={actionFlags.monitorGate}
                    onChange={(e) => setActionFlags({ ...actionFlags, monitorGate: e.target.checked })}
                    className="rounded accent-amber-600 w-4 h-4"
                  />
                  <span>Engage automated queue sensors</span>
                </label>
              </div>

              {/* Execute Button */}
              <button
                onClick={handleExecuteInterventions}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Approve &amp; Deploy Actions</span>
              </button>
            </div>

            {/* Dynamic Resource Balancing */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Dynamic Resource Balancing</h3>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Donor: Jaigarh
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Site</span>
                    <strong className="text-slate-800 text-xs">{selectedDest.site_name}</strong>
                  </div>
                  <strong className="text-amber-800 text-xs bg-amber-100/70 px-2 py-0.5 rounded">Marshals: 12 → 15 (+3)</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Traffic Units</span>
                    <strong className="text-slate-800 text-xs">Perimeter Police</strong>
                  </div>
                  <strong className="text-amber-800 text-xs bg-amber-100/70 px-2 py-0.5 rounded">Traffic: 4 → 7 (+3)</strong>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                  Surplus resources relocated from calmer sister attractions to prevent bottleneck escalation.
                </p>
              </div>
            </div>

            {/* What-If Contingency Sandbox */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-700" />
                  <h3 className="font-bold text-slate-900 text-sm">What-If Simulation</h3>
                </div>
                <span className="text-[10px] text-slate-400">Parameter Sandbox</span>
              </div>

              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setSimParams({ ...simParams, gateClosure: !simParams.gateClosure })}
                  className={`w-full py-2 px-3 rounded-xl font-bold transition-all text-left flex items-center justify-between ${
                    simParams.gateClosure ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-slate-50 border border-slate-200 text-slate-700'
                  }`}
                >
                  <span>Scenario: 20-min Gate Closure</span>
                  <span className="text-[10px] font-black">{simParams.gateClosure ? 'ACTIVE (+15m Wait)' : 'OFF'}</span>
                </button>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alternate Gate Load:</span>
                    <strong className="text-slate-900">{simParams.gateClosure ? '84% (High)' : '61% (Steady)'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Queue Saturation:</span>
                    <strong className="text-rose-700">{simParams.gateClosure ? '103 persons' : '71 persons'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: INTERACTIVE DRILL-DOWN MODAL (Opens when clicking any KPI card!) */}
      {filterModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Ground Intelligence Drill-down</span>
                <h2 className="font-serif-title text-xl font-bold text-slate-900">
                  All {filterModalCategory} Destinations ({modalFilteredList.length} Found)
                </h2>
              </div>
              <button
                onClick={() => setFilterModalCategory(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {modalFilteredList.map((dest) => (
                <div
                  key={dest.site_id}
                  onClick={() => {
                    setSelectedSiteId(dest.site_id);
                    setFilterModalCategory(null);
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedSiteId === dest.site_id
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={dest.image}
                      alt={dest.site_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{dest.site_name}</h4>
                      <p className="text-[11px] text-slate-500">{dest.city}, Rajasthan • {dest.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Capacity</span>
                      <strong className={`font-black ${
                        dest.crowd?.current_capacity_utilization >= 85 ? 'text-rose-600' : (dest.crowd?.current_capacity_utilization >= 75 ? 'text-orange-600' : 'text-slate-700')
                      }`}>
                        {dest.crowd?.current_capacity_utilization}%
                      </strong>
                    </div>
                    <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold">
                      Focus on Map
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LIVE GROUND SURVEY / UPDATE MODAL */}
      {surveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Ground Officer Ingress Update</span>
                <h3 className="font-bold text-slate-900 text-base">Update Telemetry: {selectedDest.site_name}</h3>
              </div>
              <button
                onClick={() => setSurveyModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSurveySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Live Capacity Utilization (%): {surveyData.newCapacityPct}%</label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={surveyData.newCapacityPct}
                  onChange={(e) => setSurveyData({ ...surveyData, newCapacityPct: e.target.value })}
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Crowd Status Tier</label>
                  <select
                    value={surveyData.crowdLevel}
                    onChange={(e) => setSurveyData({ ...surveyData, crowdLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Wait Time (mins)</label>
                  <input
                    type="number"
                    value={surveyData.waitMinutes}
                    onChange={(e) => setSurveyData({ ...surveyData, waitMinutes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Officer Field Notes</label>
                <textarea
                  rows={2}
                  value={surveyData.officerNotes}
                  onChange={(e) => setSurveyData({ ...surveyData, officerNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSurveyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Save &amp; Broadcast Live Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
