import NearbyCraftsSection from '../components/NearbyCraftsSection';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Bus,
  Plane,
  Train,
  ShieldCheck,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { destinations } from '../data/destinations';
import { getNearbyAndAlternatives } from '../utils/crowdEngine';
import CrowdBadge from '../components/CrowdBadge';
import CapacityMeter from '../components/CapacityMeter';
import HourlyCrowdChart from '../components/HourlyCrowdChart';
import PredictionChart from '../components/PredictionChart';
import WeatherCard from '../components/WeatherCard';
import FacilityGrid from '../components/FacilityGrid';
import DestinationCard from '../components/DestinationCard';
import DataReliabilityModal from '../components/DataReliabilityModal';

export default function DestinationDetailPage() {
  const { siteId } = useParams();
  const [modalOpen, setModalOpen] = useState(false);

  const destination = destinations.find((d) => d.site_id === siteId) || destinations[0];
  const { nearby, alternatives } = getNearbyAndAlternatives(destination, destinations, 65);

  const isHighCrowd =
    destination.crowd.current_crowd_level === 'HIGH' ||
    destination.crowd.current_crowd_level === 'CRITICAL';

  return (
    <div className="pb-20 space-y-12">
      <div className="relative bg-slate-950 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src={destination.image}
            alt={destination.site_name}
            className="w-full h-full object-cover blur-md"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/explore" className="hover:text-white">Destinations</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">{destination.city}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-200 truncate">{destination.site_name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CrowdBadge level={destination.crowd.current_crowd_level} size="lg" />
                <span className="bg-slate-800/80 border border-slate-700 text-xs px-3 py-1 rounded-full text-amber-300 font-semibold">
                  {destination.category} • {destination.sub_category}
                </span>
                <span className="bg-slate-800/80 border border-slate-700 text-xs px-3 py-1 rounded-full text-slate-300">
                  ID: {destination.site_id}
                </span>
              </div>

              <h1 className="font-serif-title text-3xl sm:text-5xl font-black tracking-tight text-white">
                {destination.site_name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                {destination.address}
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl pt-1">
                {destination.description}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-3 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Overall Visit Suitability
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-400">
                {destination.recommendation.overall_visit_score}
                <span className="text-sm font-bold text-slate-500">/100</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {destination.recommendation.recommendation_reason}
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> View Data Provenance
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-amber-800">Best Time to Visit Today</span>
              <p className="text-lg font-black text-slate-900">{destination.crowd.best_time_today}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block">Est. Gate Wait:</span>
              <strong className="text-slate-800">{destination.crowd.estimated_wait_time}</strong>
            </div>
            <div className="border-l border-amber-200 pl-3">
              <span className="text-slate-400 block">Operating Hours:</span>
              <strong className="text-slate-800">{destination.visiting.opening_time} – {destination.visiting.closing_time}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HourlyCrowdChart
              hourlyData={destination.hourly_crowd_data}
              bestTime={destination.crowd.best_time_today}
            />
          </div>
          <div className="space-y-6">
            <CapacityMeter
              utilizationPct={destination.crowd.current_capacity_utilization}
              totalCapacity={destination.crowd.total_daily_capacity}
              currentVisitors={destination.crowd.current_visitor_count}
            />
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Visiting Guidelines</h4>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Last Entry Time</span>
                <strong className="text-slate-800">{destination.visiting.last_entry_time}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Weekly Closure</span>
                <strong className="text-slate-800">{destination.visiting.closed_days}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Average Duration</span>
                <strong className="text-slate-800">{destination.visiting.average_visit_duration}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Prime Months</span>
                <strong className="text-amber-800 font-semibold">{destination.visiting.best_months_to_visit}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PredictionChart prediction={destination.prediction} siteName={destination.site_name} />
          <WeatherCard weather={destination.weather} />
        </div>

        {isHighCrowd && alternatives.length > 0 && (
          <div className="bg-amber-500/10 rounded-3xl p-6 sm:p-8 border border-amber-300 space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                <TrendingDown className="w-4 h-4 text-amber-700" /> Proximity Redistribution Advice
              </div>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Crowded Right Now! Consider These Nearby Alternatives
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                These sites offer comparable cultural richness with significantly lower queue times:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternatives.map((alt) => (
                <DestinationCard key={alt.site_id} destination={alt} showAlternativeTag={true} />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Official Entry Tariffs</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Tickets & Booking Information</h3>
            </div>
            {destination.tickets.online_ticket_available && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                Online E-Ticketing Supported
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block">Indian National</span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {destination.tickets.entry_fee_indian === 0 ? 'Free Entry' : `₹${destination.tickets.entry_fee_indian}`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block">Foreign National</span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {destination.tickets.entry_fee_foreigner === 0 ? 'Free Entry' : `₹${destination.tickets.entry_fee_foreigner}`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block">Student Pass</span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {destination.tickets.student_fee === 0 ? 'Free Entry' : `₹${destination.tickets.student_fee}`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block">Still Camera / Vehicle</span>
              <p className="text-lg font-black text-slate-900 mt-1">₹{destination.tickets.camera_fee} / ₹{destination.tickets.parking_fee}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200/80 text-xs">
            <span className="text-amber-950 font-medium">
              Authorized government booking portal: <strong>Rajasthan Tourism Official Portal</strong>
            </span>
            <a
              href={destination.tickets.ticket_booking_url}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shrink-0"
            >
              Verify on Official Portal
            </a>
          </div>
        </div>

        <FacilityGrid facilities={destination.facilities} />

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transit & Logistics</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">How to Reach {destination.site_name}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
              <Plane className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Nearest Airport</strong>
                <span className="text-slate-500 mt-0.5 block">{destination.transport.nearest_airport}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
              <Train className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Railway Station</strong>
                <span className="text-slate-500 mt-0.5 block">{destination.transport.nearest_railway_station}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
              <Bus className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Bus Station</strong>
                <span className="text-slate-500 mt-0.5 block">{destination.transport.nearest_bus_station}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">City Center Dist.</strong>
                <span className="text-slate-500 mt-0.5 block">{destination.transport.distance_from_city_center}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Visitor Profile Alignment</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Demographic & Activity Suitability</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Heritage & History', val: destination.interests.heritage_score },
              { label: 'Photography', val: destination.interests.photography_score },
              { label: 'Nature & Scenery', val: destination.interests.nature_score },
              { label: 'Spiritual / Sacred', val: destination.interests.religious_score },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{item.label}</span>
                  <span>{item.val}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

                {/* NEARBY CRAFTS & ARTISAN SHOPPING DISCOVERY */}
        <NearbyCraftsSection
          district={destination.district || destination.city}
          destinationName={destination.site_name}
        />

        <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" /> Data Transparency & Governance
            </div>
            <p className="text-slate-400">
              Heritage site details sourced from Rajasthan Tourism Economic Review 2024-25. Crowd telemetry is generated via SIH synthetic evaluation models.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors shrink-0"
          >
            Review Source Details
          </button>
        </div>
      </div>

      <DataReliabilityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
