import React, { useState, useMemo } from 'react';
import { UtensilsCrossed, AlertCircle } from 'lucide-react';
import { foods } from '../data/food';
import FoodCard from '../components/FoodCard';

export default function FoodPage() {
  const [cityFilter, setCityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [vegOnly, setVegOnly] = useState(false);

  const cities = useMemo(() => ['ALL', ...new Set(foods.map((f) => f.city))].sort(), []);
  const categories = useMemo(() => ['ALL', ...new Set(foods.map((f) => f.category))].sort(), []);

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      if (cityFilter !== 'ALL' && f.city !== cityFilter) return false;
      if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
      if (vegOnly && !f.pureVeg) return false;
      return true;
    });
  }, [cityFilter, categoryFilter, vegOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <UtensilsCrossed className="w-3.5 h-3.5" /> Taste of Rajasthan
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-black text-slate-900">
          Rajasthani Food & Local Specialties
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Iconic dishes and sweets to try across Rajasthan's cities, sourced from well-known eateries.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Cities' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="accent-amber-500"
            />
            Pure Veg Only
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filtered.length}</strong> dish{filtered.length === 1 ? '' : 'es'}
        </span>
        {(cityFilter !== 'ALL' || categoryFilter !== 'ALL' || vegOnly) && (
          <button
            onClick={() => {
              setCityFilter('ALL');
              setCategoryFilter('ALL');
              setVegOnly(false);
            }}
            className="text-amber-600 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No dishes match the active filters</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your city or category selections.
          </p>
        </div>
      )}
    </div>
  );
}
