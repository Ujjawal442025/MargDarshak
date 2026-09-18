import React, { useState, useMemo } from 'react';
import { BedDouble, AlertCircle } from 'lucide-react';
import { hotels } from '../data/hotels';
import HotelCard from '../components/HotelCard';

const PAGE_SIZE = 12;

export default function HotelsPage() {
  const [cityFilter, setCityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RATING_DESC');
  const [page, setPage] = useState(1);

  const cities = useMemo(() => ['ALL', ...new Set(hotels.map((h) => h.city))].sort(), []);
  const types = useMemo(() => ['ALL', ...new Set(hotels.map((h) => h.type))].sort(), []);

  const filtered = useMemo(() => {
    let result = hotels.filter((h) => {
      if (cityFilter !== 'ALL' && h.city !== cityFilter) return false;
      if (typeFilter !== 'ALL' && h.type !== typeFilter) return false;
      return true;
    });

    if (sortBy === 'RATING_DESC') {
      result = [...result].sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    } else if (sortBy === 'PRICE_ASC') {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'PRICE_DESC') {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [cityFilter, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <BedDouble className="w-3.5 h-3.5" /> Where to Stay
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-black text-slate-900">
          Rajasthan Hotels & Stays ({hotels.length} Curated Options)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse hotels, resorts, and homestays across Rajasthan's top destinations.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">City:</span>
            <select
              value={cityFilter}
              onChange={updateFilter(setCityFilter)}
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
            <span className="text-xs font-bold text-slate-500">Type:</span>
            <select
              value={typeFilter}
              onChange={updateFilter(setTypeFilter)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All Stay Types' : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={updateFilter(setSortBy)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="RATING_DESC">Highest Rated</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{pageItems.length}</strong> of <strong>{filtered.length}</strong> matching stays
        </span>
        {(cityFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <button
            onClick={() => {
              setCityFilter('ALL');
              setTypeFilter('ALL');
              setPage(1);
            }}
            className="text-amber-600 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {pageItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No stays match the active filters</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your city or stay type selections.
          </p>
        </div>
      )}
    </div>
  );
}
