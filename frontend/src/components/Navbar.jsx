import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  Search,
  ShieldCheck,
  Shield,
  MapPin,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/explore", label: "Explore 110+ Sites", icon: MapPin },
  {
    to: "/itinerary",
    label: "Smart Itinerary Planner",
    icon: Sparkles,
    accent: "amber",
  },
  {
    to: "/authority",
    label: "Authority Command",
    icon: Shield,
    accent: "rose",
  },
  { to: "/about", label: "Data Provenance", icon: ShieldCheck },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile drawer automatically whenever the route changes,
  // so a stale open menu never blocks the new page.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch("");
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18 gap-4">
          {/* Logo & National/State Badging */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-title font-bold text-lg md:text-xl tracking-tight text-slate-900">
                  MargDarshak
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-extrabold tracking-widest bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                  SIH26204
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 -mt-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Rajasthan Pilot
                </span>
                <p className="text-[11px] font-medium text-slate-500 tracking-tight">
                  Crowd-Aware Tourism Platform
                </p>
              </div>
            </div>
          </Link>

          {/* Quick Search on Navbar (Desktop) */}
          <form
            onSubmit={handleQuickSubmit}
            className="hidden lg:flex items-center relative max-w-xs w-full"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Amber Fort, Udaipur, Mehrangarh..."
              className="w-full bg-slate-100/90 text-xs text-slate-800 pl-9 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <Link
              to="/explore"
              className={`px-3 py-2 rounded-full transition-colors flex items-center gap-1.5 ${
                isActive("/explore")
                  ? "text-amber-700 bg-amber-50"
                  : "hover:text-amber-600 hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-600" /> Explore
            </Link>
            <Link
              to="/itinerary"
              className={`px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                isActive("/itinerary")
                  ? "text-amber-800 bg-amber-100 border-amber-300"
                  : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200/80"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Itinerary
              Planner
            </Link>
            <Link
              to="/authority"
              className={`px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                isActive("/authority")
                  ? "text-rose-800 bg-rose-100 border-rose-300"
                  : "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200/80"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-600" /> Authority Command
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-full transition-colors flex items-center gap-1.5 ${
                isActive("/about")
                  ? "text-emerald-700 bg-emerald-50"
                  : "hover:text-amber-600 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Data
              Provenance
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer — all primary destinations, including Authority Command,
          are always listed here so nothing is desktop-only. */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out border-t border-slate-200 bg-white ${
          mobileMenuOpen
            ? "max-h-[520px] opacity-100"
            : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleQuickSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Search destination or city..."
              className="w-full bg-slate-100 text-sm text-slate-800 pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </form>

          <nav className="flex flex-col gap-1.5">
            {NAV_LINKS.map(({ to, label, icon: Icon, accent }) => {
              const active = isActive(to);
              const palette =
                accent === "amber"
                  ? {
                      base: "bg-amber-50 text-amber-900 border-amber-200",
                      icon: "text-amber-600",
                      activeBase: "bg-amber-100 border-amber-300",
                    }
                  : accent === "rose"
                    ? {
                        base: "bg-rose-50 text-rose-900 border-rose-200",
                        icon: "text-rose-600",
                        activeBase: "bg-rose-100 border-rose-300",
                      }
                    : {
                        base: "bg-white text-slate-700 border-transparent",
                        icon: "text-emerald-600",
                        activeBase: "bg-slate-50 border-slate-200",
                      };

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-sm font-bold transition-colors ${
                    active ? palette.activeBase : palette.base
                  } hover:brightness-[0.98]`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${palette.icon} shrink-0`} />
                    {label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </Link>
              );
            })}

            <Link
              to="/explore?crowd=LOW"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Live Low-Crowd Sites Right Now
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
