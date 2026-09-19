import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Route as RouteIcon,
  ExternalLink,
  Heart,
  Check,
  Award,
  AlertCircle,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  RotateCw,
} from "lucide-react";
import { destinations } from "../data/destinations";
import { craftsCatalog } from "../data/craftsData";
import { getCraftCoords } from "../utils/craftLocations";
import {
  useTripCrafts,
  toggleTripCraft,
} from "../utils/tripStore";

/* ---------- helpers ---------- */

// Leaflet is normally loaded globally (window.L). If this page is opened
// directly and it is missing, load it once ourselves.
function ensureLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const existing = document.getElementById("leaflet-js");
    const script = existing || document.createElement("script");
    const done = () => (window.L ? resolve(window.L) : reject(new Error("no L")));
    script.addEventListener("load", done);
    script.addEventListener("error", reject);
    if (!existing) {
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      document.body.appendChild(script);
    }
  });
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function formatDistance(meters) {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

// Turn an OSRM step into a readable sentence + icon.
function describeStep(step) {
  const { type, modifier } = step.maneuver || {};
  const road = step.name ? ` onto ${step.name}` : "";
  const dir = modifier ? modifier.replace("_", " ") : "";
  if (type === "depart") return { icon: ArrowUp, text: `Start${step.name ? ` on ${step.name}` : ""}` };
  if (type === "arrive") return { icon: Flag, text: "You have arrived at the craft hub" };
  if (type === "roundabout" || type === "rotary")
    return { icon: RotateCw, text: `Take the roundabout${road}` };
  if (modifier && modifier.includes("left"))
    return { icon: CornerUpLeft, text: `Turn ${dir}${road}` };
  if (modifier && modifier.includes("right"))
    return { icon: CornerUpRight, text: `Turn ${dir}${road}` };
  if (type === "merge") return { icon: ArrowUp, text: `Merge${road}` };
  return { icon: ArrowUp, text: `Continue straight${road}` };
}

/* ---------- page ---------- */

export default function CraftDirectionsPage() {
  const { siteId, craftId } = useParams();
  const navigate = useNavigate();
  const tripCrafts = useTripCrafts();

  const site = useMemo(
    () => destinations.find((d) => d.site_id === siteId),
    [siteId],
  );
  const craft = useMemo(
    () => craftsCatalog.find((c) => c.craft_id === craftId),
    [craftId],
  );

  const origin = useMemo(() => {
    if (!site) return null;
    const lat = site.latitude ?? site.lat;
    const lng = site.longitude ?? site.lon;
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  }, [site]);
  const target = useMemo(() => (craft ? getCraftCoords(craft) : null), [craft]);

  const [route, setRoute] = useState(null); // { distance, duration, coords, steps, estimated }
  const [routeLoading, setRouteLoading] = useState(true);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // 1) Fetch the driving route (OSRM). Fall back to a straight-line estimate.
  useEffect(() => {
    if (!origin || !target) return;
    let cancelled = false;
    setRouteLoading(true);
    setRoute(null);

    const fallback = () => {
      const km = haversineKm(origin, target) * 1.3; // roads wind, pad 30%
      return {
        distance: km * 1000,
        duration: (km / 40) * 3600, // ~40 km/h average
        coords: [
          [origin.lat, origin.lng],
          [target.lat, target.lng],
        ],
        steps: [],
        estimated: true,
      };
    };

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.lng},${origin.lat};${target.lng},${target.lat}` +
      `?overview=full&geometries=geojson&steps=true`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const r = data.routes && data.routes[0];
        if (!r) return setRoute(fallback());
        setRoute({
          distance: r.distance,
          duration: r.duration,
          coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          steps: (r.legs || []).flatMap((leg) => leg.steps || []),
          estimated: false,
        });
      })
      .catch(() => !cancelled && setRoute(fallback()))
      .finally(() => {
        clearTimeout(timer);
        if (!cancelled) setRouteLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [origin, target]);

  // 2) Draw the map once the route is ready.
  useEffect(() => {
    if (!route || !mapRef.current || !origin || !target) return;
    let disposed = false;

    ensureLeaflet()
      .then((L) => {
        if (disposed || !mapRef.current) return;
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
        const map = L.map(mapRef.current, { zoomControl: true });
        mapInstance.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        const pin = (color, label) =>
          L.divIcon({
            className: "",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">${label}</div>`,
          });

        L.marker([origin.lat, origin.lng], { icon: pin("#2563eb", "A") })
          .addTo(map)
          .bindPopup(`<b>${site.site_name}</b><br/>Start`);
        L.marker([target.lat, target.lng], { icon: pin("#d97706", "B") })
          .addTo(map)
          .bindPopup(`<b>${craft.craft_name}</b><br/>${craft.artisan_hub || craft.city}`);

        const line = L.polyline(route.coords, {
          color: route.estimated ? "#64748b" : "#d97706",
          weight: 5,
          opacity: 0.9,
          dashArray: route.estimated ? "8 10" : null,
        }).addTo(map);
        map.fitBounds(line.getBounds(), { padding: [40, 40] });
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [route, origin, target, site, craft]);

  /* ---------- not found ---------- */
  if (!site || !craft || !origin || !target) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Directions unavailable
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          We couldn't find that destination or craft. Go back and try again.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
        >
          Go back
        </button>
      </div>
    );
  }

  const inTrip = tripCrafts.some((c) => c.craft_id === craft.craft_id);
  const gmapsUrl =
    `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}` +
    `&destination=${target.lat},${target.lng}&travelmode=driving`;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        {/* Back */}
        <Link
          to={`/destination/${site.site_id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {site.site_name}
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5 text-amber-600" /> Craft Directions
          </span>
          <h1 className="font-serif-title text-2xl md:text-3xl font-black text-slate-900 mt-3">
            {site.site_name} → {craft.craft_name}
          </h1>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">A</div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase font-bold text-blue-700">From (Start)</p>
                <p className="text-sm font-bold text-slate-900 truncate">{site.site_name}</p>
                <p className="text-xs text-slate-500">{site.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm">B</div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase font-bold text-amber-700">To (Craft hub)</p>
                <p className="text-sm font-bold text-slate-900 truncate">{craft.craft_name}</p>
                <p className="text-xs text-slate-500 truncate">{craft.artisan_hub || craft.city}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <RouteIcon className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900">
                {route ? formatDistance(route.distance) : "…"}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">Distance</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900">
                {route ? formatDuration(route.duration) : "…"}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">By car</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-sm font-black text-slate-900 leading-7">
                {craft.best_time_to_shop || "—"}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">Best time to shop</p>
            </div>
          </div>

          {route?.estimated && !routeLoading && (
            <p className="mt-4 text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-xl p-3">
              Live routing is unreachable right now, so this is a straight-line
              estimate (dashed line). Open Google Maps for exact turn-by-turn.
            </p>
          )}
          {target.precision !== "exact" && (
            <p className="mt-3 text-[11px] text-slate-400">
              Craft location is the {target.precision === "town" ? "town / hub area" : "district centre"}, not the exact workshop door.
            </p>
          )}
        </div>

        {/* Map + steps */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative min-h-[420px]">
            <div ref={mapRef} className="absolute inset-0" />
            {routeLoading && (
              <div className="absolute inset-0 z-[500] bg-white/80 flex items-center justify-center text-sm font-semibold text-slate-600">
                Finding best route…
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col">
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" /> Turn-by-turn
            </h2>
            <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1">
              {routeLoading && <p className="text-xs text-slate-500">Loading steps…</p>}
              {!routeLoading && route && route.steps.length === 0 && (
                <p className="text-xs text-slate-500">
                  Step-by-step directions aren't available for this estimate.
                  Use "Open in Google Maps" below.
                </p>
              )}
              {route?.steps.map((step, i) => {
                const { icon: Icon, text } = describeStep(step);
                return (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs text-slate-700 leading-snug">
                      {text}
                      {step.distance > 0 && (
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          {formatDistance(step.distance)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
              </a>
              <button
                onClick={() => toggleTripCraft(craft, site.site_name, site.site_id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  inTrip
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {inTrip ? (
                  <><Check className="w-3.5 h-3.5" /> Added to Trip</>
                ) : (
                  <><Heart className="w-3.5 h-3.5" /> Add Craft to Itinerary</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Craft summary */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex gap-4 items-center">
          {craft.image && (
            <img src={craft.image} alt={craft.craft_name} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {craft.gi_tagged && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  <Award className="w-3 h-3" /> GI Tagged
                </span>
              )}
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                {craft.category}
              </span>
            </div>
            <h3 className="font-bold text-slate-900">{craft.craft_name}</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{craft.description}</p>
            <p className="text-xs font-semibold text-slate-700 mt-1">{craft.price_range}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
