import React, { useState } from 'react';
import { Sparkles, MapPin, Award, ArrowRight, Compass } from 'lucide-react';
import { getCraftsForDistrict } from '../data/craftsData';
import CraftDetailModal from './CraftDetailModal';

export default function NearbyCraftsSection({ district, destinationName, destinationId }) {
  const [selectedCraft, setSelectedCraft] = useState(null);
  const crafts = getCraftsForDistrict(district);

  if (!crafts || crafts.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Local Artisan Discovery & Handicrafts
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-slate-900">
            Nearby Crafts & Artisan Shopping
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            "Take a piece of Rajasthan home with you." Authentic mastercrafts native to the <strong>{district}</strong> circuit.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 font-semibold">
          {crafts.length} Traditional Craft Centers Found
        </div>
      </div>

      {/* Grid of Crafts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {crafts.map((craft) => (
          <div
            key={craft.craft_id}
            className="group bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400/80 p-4 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Image */}
              <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 bg-slate-200">
                <img
                  src={craft.image}
                  alt={craft.craft_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                
                {craft.gi_tagged && (
                  <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Award className="w-3 h-3" /> GI Tagged
                  </span>
                )}

                <span className="absolute bottom-2.5 left-2.5 text-white text-[11px] font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{craft.artisan_hub}</span>
                </span>
              </div>

              {/* Category & Title */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                {craft.category}
              </span>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors line-clamp-1">
                {craft.craft_name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                {craft.description}
              </p>

              {/* Price & Proximity */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Price Indication</span>
                  <strong className="text-slate-800 text-[11px]">{craft.price_range}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">From {destinationName ? destinationName.split(' ')[0] : 'Site'}</span>
                  <span className="font-bold text-amber-800 text-[11px]">~{craft.approx_distance_km} km</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setSelectedCraft(craft)}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Explore Craft & Workshops</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Craft Detail Modal */}
      <CraftDetailModal
        craft={selectedCraft}
        destinationName={destinationName}
        destinationId={destinationId}
        isOpen={!!selectedCraft}
        onClose={() => setSelectedCraft(null)}
      />
    </section>
  );
}
