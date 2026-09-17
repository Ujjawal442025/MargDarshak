import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, TrendingDown } from 'lucide-react';
import { destinations } from '../data/destinations';
import { searchDestinations, getNearbyAndAlternatives } from '../utils/crowdEngine';
import DestinationCard from '../components/DestinationCard';
import CrowdBadge from '../components/CrowdBadge';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const matchedDestinations = useMemo(() => {
    return searchDestinations(destinations, query);
  }, [query]);

  const primaryDestination = matchedDestinations[0] || null;

  const { nearby, alternatives } = useMemo(() => {
    if (!primaryDestination) return { nearby: [], alternatives: [] };
    return getNearbyAndAlternatives(primaryDestination, destinations, 60);
  }, [primaryDestination]);

  const isPrimaryCrowded =
    primaryDestination &&
    (primaryDestination.crowd.current_crowd_level === 'HIGH' ||
      primaryDestination.crowd.current_crowd_level === 'CRITICAL');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Search Results</span>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Results for "{query}"
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Found {matchedDestinations.length} matching site{matchedDestinations.length === 1 ? '' : 's'} in Rajasthan dataset
          </p>
        </div>

        <Link
          to="/explore"
          className="self-start sm:self-auto text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          View Full Directory
        </Link>
      </div>

      {primaryDestination ? (
        <div className="space-y-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <CrowdBadge level={primaryDestination.crowd.current_crowd_level} size="md" />
                  <span className="text-xs font-semibold text-slate-500">
                    Capacity: <strong>{primaryDestination.crowd.current_capacity_utilization}%</strong>
                  </span>
                </div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-slate-900">
                  {primaryDestination.site_name}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {primaryDestination.city}, Rajasthan • {primaryDestination.category}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Visit Score</span>
                  <p className="text-2xl font-black text-amber-600">
                    {primaryDestination.recommendation.overall_visit_score}
                    <span className="text-xs text-slate-400">/100</span>
                  </p>
                </div>
                <Link
                  to={`/destination/${primaryDestination.site_id}`}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Full Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 font-semibold block">Best Time Today</span>
                <strong className="text-xs text-slate-800">{primaryDestination.crowd.best_time_today}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 font-semibold block">Gate Wait Time</span>
                <strong className="text-xs text-slate-800">{primaryDestination.crowd.estimated_wait_time}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 font-semibold block">Weather Comfort</span>
                <strong className="text-xs text-slate-800">{primaryDestination.weather.temperature}°C • {primaryDestination.weather.weather_condition}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 font-semibold block">Recommendation Status</span>
                <strong className="text-xs text-amber-800 truncate block">{primaryDestination.recommendation.recommendation_reason}</strong>
              </div>
            </div>
          </div>

          {isPrimaryCrowded && alternatives.length > 0 && (
            <div className="bg-amber-500/10 rounded-3xl p-6 sm:p-8 border border-amber-300/80 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <TrendingDown className="w-4 h-4 text-amber-700" /> Proximity Crowd Redistribution Engine
                </div>
                <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  Recommended Lower-Crowd Alternatives Nearby
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {primaryDestination.site_name} is currently experiencing elevated footfall. We recommend these calmer sites within direct radius:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {alternatives.map((alt) => (
                  <DestinationCard key={alt.site_id} destination={alt} showAlternativeTag={true} />
                ))}
              </div>
            </div>
          )}

          {nearby.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif-title text-xl font-bold text-slate-900">
                Other Nearby Destinations in {primaryDestination.city}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearby.map((item) => (
                  <DestinationCard key={item.site_id} destination={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
          <Search className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No destination matching "{query}"</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please check the spelling or explore our complete catalog of Rajasthan destinations.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
          >
            Browse All Destinations
          </Link>
        </div>
      )}
    </div>
  );
}
