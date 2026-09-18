import React from 'react';
import { MapPin, UtensilsCrossed, Leaf } from 'lucide-react';

export default function FoodCard({ food }) {
  if (!food) return null;

  return (
    <div className="group bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400/80 p-4 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col justify-between">
      <div>
        <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 bg-slate-200">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {food.pureVeg && (
            <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Pure Veg
            </span>
          )}

          <span className="absolute bottom-2.5 left-2.5 text-white text-[11px] font-bold flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {food.city}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{food.name}</h3>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full uppercase tracking-wide mb-2">
          <UtensilsCrossed className="w-3 h-3" /> {food.category}
        </span>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{food.description}</p>
      </div>
    </div>
  );
}
