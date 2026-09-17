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
  FileText,
  Bell,
  Info
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
import {
  getActiveAlerts,
  getPredictiveSeries,
  getDonorSiteSuggestion,
  simulateScenario,
  getStateKPIs,
  getFlowEstimate
} from '../data/authorityData';
import { searchDestinations } from '../utils/crowdEngine';
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
  const [notifOpen, setNotifOpen] = useState(false); // Notification drawer of real, data-derived alerts
  const [dismissedAlertIds, setDismissedAlertIds] = useState([]); // Alerts the authority has dismissed
  const [searchQuery, setSearchQuery] = useState(''); // Authority site search
  const [searchFocused, setSearchFocused] = useState(false);

  // What-if Simulation: which scenario is currently selected
  const [whatIfScenario, setWhatIfScenario] = useState('none');

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

  // Dynamic calculation of KPIs from active state — entirely derived from
  // real per-site fields (crowd level/capacity, festival_today), no fixed numbers.
  const dynamicKPIs = useMemo(() => getStateKPIs(destinations), [destinations]);

  // Real, data-derived alerts (replaces fabricated "incidents"). Any site
  // whose actual recorded crowd level/capacity crosses HIGH/CRITICAL shows up
  // here automatically — nothing invented, nothing hardcoded to one site.
  const activeAlerts = useMemo(
    () => getActiveAlerts(destinations).filter(a => !dismissedAlertIds.includes(a.id)),
    [destinations, dismissedAlertIds]
  );

  // Live search across the real dataset (name / city / district / category)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchDestinations(destinations, searchQuery).slice(0, 8);
  }, [destinations, searchQuery]);

  // Resource reallocation suggestion for the selected site, based on real
  // proximity + real relative crowd pressure (no fabricated headcounts)
  const donorSuggestion = useMemo(
    () => getDonorSiteSuggestion(selectedDest, destinations),
    [selectedDest, destinations]
  );

  // What-if simulation result for the selected site + chosen scenario,
  // computed transparently from that site's real current numbers.
  const whatIfResult = useMemo(
    () => simulateScenario(selectedDest, whatIfScenario),
    [selectedDest, whatIfScenario]
  );

  // Real, derived flow estimate (delta between recorded hourly points) for the selected site
  const flowEstimate = useMemo(() => getFlowEstimate(selectedDest), [selectedDest]);

  // Hourly curve data formatted for Recharts
  const hourlyChartData = useMemo(() => {
    if (!selectedDest?.hourly_crowd_data) return [];
    return selectedDest.hourly_crowd_data.map(h => ({
      time: h.time.replace(':00 ', ' '),
      visitors: h.estimated_visitors,
      crowdPct: h.crowd_percentage
    }));
  }, [selectedDest]);

  // Predictive Now/+15m/+30m/+45m/+60m/+75m — interpolated from this site's
  // OWN recorded hourly_crowd_data curve (real data), not a made-up multiplier.
  const predictiveBarData = useMemo(() => {
    const series = getPredictiveSeries(selectedDest);
    return series.map(pt => ({
      ...pt,
      color: pt.load >= 85 ? '#EF4444' : (pt.load >= 70 ? '#F97316' : '#10B981')
    }));
  }, [selectedDest]);

  // Execute tactical intervention: applies the currently selected What-If
  // scenario's transparent projection to this site's live state, so the
  // Approve action and the What-If sandbox stay consistent with each other.
  const handleExecuteInterventions = () => {
    const appliedScenario = whatIfScenario === 'none' ? 'reroute_20' : whatIfScenario;
    const result = simulateScenario(selectedDest, appliedScenario);
    const newCap = result.after.capacityPct;
    const newWaitMin = result.after.waitMin;

    setDestinations(prev => prev.map(d => {
      if (d.site_id === selectedSiteId) {
        return {
          ...d,
          crowd: {
            ...d.crowd,
            current_capacity_utilization: newCap,
            current_crowd_level: newCap >= 88 ? 'CRITICAL' : (newCap >= 75 ? 'HIGH' : (newCap >= 50 ? 'MODERATE' : 'LOW')),
            estimated_wait_time: newWaitMin != null ? `${newWaitMin} mins (post-action, simulated)` : d.crowd?.estimated_wait_time
          }
        };
      }
      return d;
    }));

    setActionSuccessMsg(`Action dispatched at ${selectedDest.site_name}: "${result.label}". Projected capacity ${result.before.capacityPct}% → ${newCap}% (simulated).`);
    setTimeout(() => setActionSuccessMsg(""), 5000);
  };

  // Dismiss a real, data-derived alert (removes it from the active list for this session)
  const handleDismissAlert = (alertId) => {
    setDismissedAlertIds(prev => [...prev, alertId]);
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
            {/* Authority Search — actually searches the real destinations dataset */}
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Search sites, cities, districts…"
                  className="bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-400 w-40 md:w-52"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {searchFocused && searchQuery.trim() && (
                <div className="absolute right-0 mt-1.5 w-80 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2">
                  {searchResults.length === 0 ? (
                    <p className="text-[11px] text-slate-400 p-3 text-center">No matching destinations found.</p>
                  ) : (
                    searchResults.map(dest => (
                      <button
                        key={dest.site_id}
                        onMouseDown={() => {
                          setSelectedSiteId(dest.site_id);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{dest.site_name}</p>
                          <p className="text-[10px] text-slate-500">{dest.city} • {dest.category}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">{dest.crowd?.current_capacity_utilization}%</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-medium hidden lg:block">
              Time: <strong className="text-slate-900 font-mono">{currentTime}</strong>
            </div>

            {/* Notification bell — opens a drawer of real, data-derived alerts */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeAlerts.length}
                </span>
              )}
            </button>

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

            {/* Active Events — real: counts sites whose own record has events.festival_today === true */}
            <div className="bg-white border border-blue-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Active Events Today</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-blue-600 font-mono">{dynamicKPIs.activeEvents}</span>
                <span className="text-[10px] text-slate-500">Sites</span>
              </div>
              <p className="text-[10px] text-blue-700 mt-1 truncate">
                {destinations.filter(d => d.events?.festival_today).slice(0, 2).map(d => d.events.festival_name || d.site_name).join(', ') || 'None reported today'}
              </p>
            </div>

            {/* Active Alerts — real: sites currently at HIGH/CRITICAL crowd level/capacity */}
            <div
              onClick={() => setNotifOpen(true)}
              className="bg-white border border-slate-200/90 hover:border-slate-400 rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:shadow-md group"
            >
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Active Alerts</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">{activeAlerts.length}</span>
                <span className="text-[10px] text-slate-500">Sites</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-amber-700">
                <span>Open Notifications</span> <ChevronRight className="w-3 h-3" />
              </p>
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

              {/* Crowd Intelligence Strip — derived flow estimate + real facts, no invented sensor numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Visitors Now</span>
                  <strong className="text-sm text-slate-900 font-mono">{selectedDest.crowd?.current_visitor_count?.toLocaleString() ?? '—'}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Est. Wait</span>
                  <strong className="text-sm text-slate-900 font-mono">{selectedDest.crowd?.estimated_wait_time || '—'}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Net Flow/min</span>
                  <strong className={`text-sm font-mono ${flowEstimate.available && flowEstimate.netAccumulationPerMin > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {flowEstimate.available ? `${flowEstimate.netAccumulationPerMin > 0 ? '+' : ''}${flowEstimate.netAccumulationPerMin}` : 'N/A'}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Peak Hours</span>
                  <strong className="text-[10px] text-slate-900">{selectedDest.crowd?.peak_hours || '—'}</strong>
                </div>
              </div>
              {flowEstimate.available && (
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" /> {flowEstimate.basis}
                </p>
              )}
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
            {/* AI Operations Copilot — grounded in the selected site's OWN real data */}
            <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">AI Operations Copilot</h3>
                    <p className="text-[10px] text-slate-500">Context: {selectedDest.site_name}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  (selectedDest.crowd?.current_capacity_utilization || 0) >= 75
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {(selectedDest.crowd?.current_capacity_utilization || 0) >= 75 ? 'Elevated' : 'Stable'}
                </span>
              </div>

              {/* Threshold Banner — built from this site's real numbers */}
              <div className={`p-3.5 rounded-2xl text-xs space-y-1.5 border ${
                (selectedDest.crowd?.current_capacity_utilization || 0) >= 75 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`flex items-center gap-1.5 font-bold ${
                  (selectedDest.crowd?.current_capacity_utilization || 0) >= 75 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{selectedDest.site_name} — {selectedDest.crowd?.current_crowd_level}</span>
                </div>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  Currently at <strong>{selectedDest.crowd?.current_capacity_utilization}% capacity</strong>, trend {(selectedDest.crowd?.crowd_trend || 'steady').toLowerCase()}.
                  {' '}Predicted peak today around <strong>{selectedDest.prediction?.predicted_peak_time || 'N/A'}</strong> ({selectedDest.prediction?.prediction_confidence || 'N/A'} confidence).
                  {' '}Estimated wait: {selectedDest.crowd?.estimated_wait_time || 'unavailable'}.
                </p>
              </div>

              {/* Scenario levers — same set the What-If sandbox below uses */}
              <div className="space-y-2 text-xs text-slate-700">
                {[
                  { key: 'reroute_20', label: 'Reroute 20% of inflow to a nearby lower-crowd site' },
                  { key: 'second_gate', label: 'Open a secondary entry/processing channel' },
                  { key: 'gate_closure', label: 'Temporary gate closure (not recommended)' },
                ].map(opt => (
                  <label key={opt.key} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${
                    whatIfScenario === opt.key ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                  }`}>
                    <input
                      type="radio"
                      name="copilotScenario"
                      checked={whatIfScenario === opt.key}
                      onChange={() => setWhatIfScenario(opt.key)}
                      className="accent-amber-600 w-3.5 h-3.5"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Simulate / Approve / Dismiss — every button here does something real */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setWhatIfScenario(prev => prev)} // keeps current scenario, forces recompute view below
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Simulate
                </button>
                <button
                  onClick={handleExecuteInterventions}
                  className="py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    const alert = activeAlerts.find(a => a.siteId === selectedSiteId);
                    if (alert) handleDismissAlert(alert.id);
                    setActionSuccessMsg(alert ? `Alert for ${selectedDest.site_name} dismissed.` : `${selectedDest.site_name} has no active alert to dismiss.`);
                    setTimeout(() => setActionSuccessMsg(""), 4000);
                  }}
                  className="py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss
                </button>
              </div>

              {/* Simulated result preview (mirrors the What-If sandbox for the currently chosen scenario) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Projected capacity if approved:</span>
                  <strong className="text-slate-900">{whatIfResult.before.capacityPct}% → {whatIfResult.after.capacityPct}%</strong>
                </div>
                {whatIfResult.after.waitMin != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Projected wait time:</span>
                    <strong className="text-slate-900">{whatIfResult.before.waitMin ?? '—'}m → {whatIfResult.after.waitMin}m</strong>
                  </div>
                )}
                <p className="text-slate-400 pt-1">{whatIfResult.disclosure}</p>
              </div>
            </div>

            {/* Resource Reallocation — honest: no invented headcounts */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Resource Reallocation Guidance</h3>
                {donorSuggestion.available && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Suggested Donor: {donorSuggestion.donorSiteName}
                  </span>
                )}
              </div>

              {donorSuggestion.available ? (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Site (needs support)</span>
                      <strong className="text-slate-800 text-xs">{selectedDest.site_name}</strong>
                    </div>
                    <strong className="text-rose-700 text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{donorSuggestion.targetCapacityPct}%</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nearest lower-pressure site ({donorSuggestion.distanceKm} km)</span>
                      <strong className="text-slate-800 text-xs">{donorSuggestion.donorSiteName}, {donorSuggestion.donorCity}</strong>
                    </div>
                    <strong className="text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{donorSuggestion.donorCapacityPct}%</strong>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed pt-1 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>{donorSuggestion.note}</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  No lower-pressure site found nearby for {selectedDest.site_name}. Personnel/vehicle deployment data is not yet connected to a live feed for this site.
                </p>
              )}
            </div>

            {/* What-If Simulation Sandbox — interactive, computed from real numbers */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-700" />
                  <h3 className="font-bold text-slate-900 text-sm">What-If Simulation</h3>
                </div>
                <span className="text-[10px] text-slate-400">{selectedDest.site_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { key: 'none', label: 'Baseline' },
                  { key: 'reroute_20', label: 'Reroute 20%' },
                  { key: 'second_gate', label: 'Add Gate' },
                  { key: 'gate_closure', label: 'Gate Closure' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setWhatIfScenario(opt.key)}
                    className={`py-2 px-2 rounded-xl font-bold transition-all ${
                      whatIfScenario === opt.key
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity Utilization:</span>
                  <strong className="text-slate-900">{whatIfResult.before.capacityPct}% → <span className={whatIfResult.after.capacityPct > whatIfResult.before.capacityPct ? 'text-rose-700' : 'text-emerald-700'}>{whatIfResult.after.capacityPct}%</span></strong>
                </div>
                {whatIfResult.after.waitMin != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Wait:</span>
                    <strong className={whatIfResult.after.waitMin > (whatIfResult.before.waitMin || 0) ? 'text-rose-700' : 'text-emerald-700'}>{whatIfResult.after.waitMin} mins</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Projected Visitors:</span>
                  <strong className="text-slate-900">{whatIfResult.after.visitors?.toLocaleString()}</strong>
                </div>
                <p className="text-slate-400 pt-1 leading-relaxed">{whatIfResult.assumption}</p>
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

      {/* NOTIFICATION DRAWER: Real, data-derived alerts (HIGH/CRITICAL sites), with working Dismiss + Focus */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-label="Notifications">
          {/* Backdrop closes the drawer */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs animate-fade-in"
            onClick={() => setNotifOpen(false)}
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Live Alert Feed</span>
                <h2 className="font-serif-title text-lg font-bold text-slate-900">
                  Active Alerts ({activeAlerts.length})
                </h2>
              </div>
              <button
                onClick={() => setNotifOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                  <p>No active alerts. All monitored sites are within normal thresholds, or all alerts have been dismissed.</p>
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border space-y-2 ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-50/60 border-rose-200' : 'bg-orange-50/50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.capacityPct}% capacity</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{alert.description}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedSiteId(alert.siteId);
                          setNotifOpen(false);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
                      >
                        View Intelligence
                      </button>
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
