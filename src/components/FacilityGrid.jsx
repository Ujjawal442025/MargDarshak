import React from 'react';
import {
  Car,
  Bath,
  GlassWater,
  UtensilsCrossed,
  Armchair,
  Accessibility,
  HeartPulse,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function FacilityGrid({ facilities }) {
  if (!facilities) return null;

  const items = [
    { label: 'Vehicle Parking', status: facilities.parking_available, detail: facilities.parking_capacity, icon: Car },
    { label: 'Clean Restrooms', status: facilities.toilets_available, detail: 'Available onsite', icon: Bath },
    { label: 'RO Drinking Water', status: facilities.drinking_water, detail: 'Complimentary kiosks', icon: GlassWater },
    { label: 'Cafeteria / Dining', status: facilities.food_available, detail: 'Snacks & refreshments', icon: UtensilsCrossed },
    { label: 'Visitor Seating & Rest', status: facilities.rest_area, detail: 'Shaded benches available', icon: Armchair },
    { label: 'Wheelchair Ramp', status: facilities.wheelchair_ramp, detail: 'Ramps at key gates', icon: Accessibility },
    { label: 'Emergency First Aid', status: facilities.first_aid, detail: 'Medical station onsite', icon: HeartPulse },
    { label: 'Tourist Information Desk', status: facilities.tourist_information_center, detail: 'Official guides & audio', icon: Info },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Amenity Verification</span>
        <h3 className="text-base font-bold text-slate-900 mt-0.5">Visitor Facilities & Accessibility</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                item.status
                  ? 'bg-slate-50/70 border-slate-200/80'
                  : 'bg-rose-50/40 border-rose-100 opacity-70'
              }`}
            >
              <div className={`p-2 rounded-lg ${item.status ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.label}</p>
                  {item.status ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
