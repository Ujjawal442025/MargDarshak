import React, { useState } from 'react';
import { Sparkles, MapPin, Award, Clock, IndianRupee, X, Check, Navigation, Heart } from 'lucide-react';

export default function CraftDetailModal({ craft, destinationName, isOpen, onClose }) {
  const [addedToTrip, setAddedToTrip] = useState(false);
  const [copiedDirections, setCopiedDirections] = useState(false);

  if (!isOpen || !craft) return null;

  const handleDirections = () => {
    setCopiedDirections(true);
    setTimeout(() => setCopiedDirections(false), 2500);
  };

  const handleAddToTrip = () => {
    setAddedToTrip(!addedToTrip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
        {/* Header Image */}
        <div className="relative h-56 w-full bg-slate-900 shrink-0">
          <img
            src={craft.image}
            alt={craft.craft_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              {craft.gi_tagged && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  <Award className="w-3 h-3" /> GI Tagged Craft
                </span>
              )}
              <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-amber-200">
                {craft.category}
              </span>
            </div>
            <h2 className="font-serif-title text-2xl font-bold text-white tracking-wide">
              {craft.craft_name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Proximity Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Artisan Hub & Location</span>
                <strong className="text-slate-900 text-xs">{craft.artisan_hub} ({craft.city})</strong>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-900 block">Proximity from {destinationName || 'Site'}</span>
              <span className="font-extrabold text-amber-950 text-xs bg-amber-200/80 px-2 py-0.5 rounded-md">
                ~{craft.approx_distance_km} km away
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">About This Heritage Craft</h3>
            <p className="leading-relaxed text-slate-600">
              {craft.description}
            </p>
          </div>

          {/* Cultural Significance & Community */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Artisan Community</span>
              <strong className="text-slate-800 block text-xs">{craft.community}</strong>
              <p className="text-[11px] text-slate-500 mt-1">{craft.tourism_relevance}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Estimated Price Range</span>
              <strong className="text-amber-700 block text-sm font-black">{craft.price_range}</strong>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Best visiting hours: {craft.best_time_to_shop}
              </p>
            </div>
          </div>

          {/* Notice on Authenticity */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
            🌿 <strong>Artisan Support Notice:</strong> Visiting community workshops directly supports indigenous Rajasthani craftsmen and ensures heritage preservation under fair-trade principles.
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleDirections}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-600" />
            <span>{copiedDirections ? 'Directions Routed!' : 'Get Directions'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToTrip}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                addedToTrip
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {addedToTrip ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Trip!</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5" />
                  <span>Add Craft to Itinerary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
