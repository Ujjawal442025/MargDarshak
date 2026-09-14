import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

export default function DestinationCard({ destination, showAlternativeTag = false }) {
  if (!destination) return null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.image}
          alt={destination.site_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <CrowdBadge level={destination.crowd.current_crowd_level} size="sm" />
          <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
            {destination.category}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1 text-xs font-medium text-amber-200">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{destination.city}, Rajasthan</span>
          </div>
          {destination.distance_km !== undefined && (
            <span className="bg-amber-500/90 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-md">
              {destination.distance_km} km away
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-1">
              {destination.site_name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0 text-xs font-bold text-amber-900">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{destination.recommendation.overall_visit_score}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {destination.short_description || destination.description}
          </p>

          <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Best Time Today:</span>
              <strong className="text-slate-800">{destination.crowd.best_time_today}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Capacity Load:</span>
              <span className="font-semibold text-slate-700">{destination.crowd.current_capacity_utilization}%</span>
            </div>
          </div>
        </div>

        <Link
          to={`/destination/${destination.site_id}`}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-amber-600 font-semibold text-xs transition-colors shadow-xs"
        >
          <span>View Crowd Analytics</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
