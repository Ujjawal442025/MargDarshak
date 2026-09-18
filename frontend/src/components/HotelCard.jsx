import React from 'react';
import { MapPin, Star, BedDouble, ExternalLink } from 'lucide-react';

export default function HotelCard({ hotel }) {
  if (!hotel) return null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
            <BedDouble className="w-3 h-3" /> {hotel.type}
          </span>
          {hotel.starRating ? (
            <span className="bg-amber-500/90 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-md">
              {hotel.starRating}★ Property
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-amber-200">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{hotel.city}, Rajasthan</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-1">
              {hotel.name}
            </h3>
            {hotel.userRating ? (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0 text-xs font-bold text-amber-900">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{hotel.userRating}</span>
              </div>
            ) : null}
          </div>

          {hotel.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {hotel.amenities.map((a) => (
                <span
                  key={a}
                  className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 mb-3">
            <span className="text-slate-400 font-medium">Approx. Price:</span>
            <strong className="text-slate-800">
              {hotel.price ? `₹${hotel.price} / night` : 'Not available'}
            </strong>
          </div>
        </div>

        {hotel.bookingUrl && (
          <a
            href={hotel.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-amber-600 font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Check Availability</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
}
