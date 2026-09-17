import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, AlertCircle } from 'lucide-react';
import { destinations } from '../data/destinations';
import DestinationCard from '../components/DestinationCard';
import { searchDestinations } from '../utils/crowdEngine';

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const initialCrowd = searchParams.get('crowd') || 'ALL';
  const initialCity = searchParams.get('city') || 'ALL';
  const initialCategory = searchParams.get('cat') || 'ALL';

  const [crowdFilter, setCrowdFilter] = useState(initialCrowd);
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('RECOMMENDED');

  const cities = useMemo(() => ['ALL', ...new Set(destinations.map((d) => d.city))].sort(), []);
  const categories = useMemo(() => ['ALL', ...new Set(destinations.map((d) => d.category))].sort(), []);

  const filtered = useMemo(() => {
    let result = searchDestinations(destinations, '', {
      crowdLevel: crowdFilter,
      city: cityFilter,
      category: categoryFilter,
    });

    if (sortBy === 'RECOMMENDED') {
      result.sort((a, b) => b.recommendation.overall_visit_score - a.recommendation.overall_visit_score);
    } else if (sortBy === 'CROWD_ASC') {
      const rank = { LOW: 1, MODERATE: 2, HIGH: 3, CRITICAL: 4 };
      result.sort((a, b) => rank[a.crowd.current_crowd_level] - rank[b.crowd.current_crowd_level]);
    } else if (sortBy === 'CAPACITY_ASC') {
      result.sort((a, b) => a.crowd.current_capacity_utilization - b.crowd.current_capacity_utilization);
    }

    return result;
  }, [crowdFilter, cityFilter, categoryFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <MapPin className="w-3.5 h-3.5" /> Destination Explorer
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-black text-slate-900">
          Rajasthan Tourist Directory ({destinations.length} Verified Sites)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Filter by real-time density, district, or cultural category to plan an optimal visit.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Crowd:</span>
            <select
              value={crowdFilter}
              onChange={(e) => setCrowdFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Crowd Levels</option>
              <option value="LOW">🟢 Low Crowd Only</option>
              <option value="MODERATE">🟡 Moderate</option>
              <option value="HIGH">🟠 High Surge</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">District:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Districts' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="RECOMMENDED">Highest Visit Score</option>
            <option value="CROWD_ASC">Lowest Crowd First</option>
            <option value="CAPACITY_ASC">Lowest Capacity Load</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filtered.length}</strong> matching destination{filtered.length === 1 ? '' : 's'}
        </span>
        {(crowdFilter !== 'ALL' || cityFilter !== 'ALL' || categoryFilter !== 'ALL') && (
          <button
            onClick={() => {
              setCrowdFilter('ALL');
              setCityFilter('ALL');
              setCategoryFilter('ALL');
            }}
            className="text-amber-600 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <DestinationCard key={dest.site_id} destination={dest} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No destinations match the active filters</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your crowd level or district selections to see more heritage landmarks.
          </p>
        </div>
      )}
    </div>
  );
}
