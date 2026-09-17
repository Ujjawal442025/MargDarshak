import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Map,
  Home,
  Info,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Map },
    { name: "AI Itinerary", path: "/itinerary", icon: Sparkles },
    {
      name: "Authority Command",
      path: "/authority",
      icon: ShieldAlert,
    },
    { name: "About", path: "/about", icon: Info },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 block leading-tight">
                Marg<span className="text-blue-600">Darshak</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
                Rajasthan Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              const isAuthority = link.path === "/authority-command";

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-2 ${
                    active
                      ? isAuthority
                        ? "bg-red-50 text-red-700 border border-red-200 shadow-sm"
                        : "bg-blue-600 text-white shadow-sm"
                      : isAuthority
                        ? "bg-red-50/50 text-red-600 hover:bg-red-100/70 border border-red-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isAuthority && !active ? "text-red-500" : ""}`}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/authority-command"
              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center"
              title="Authority Command"
            >
              <ShieldAlert className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            const isAuthority = link.path === "/authority-command";

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? isAuthority
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-blue-600 text-white shadow-sm"
                    : isAuthority
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
