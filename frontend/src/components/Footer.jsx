import React from 'react';
import { Compass, Shield, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif-title text-xl font-bold text-white tracking-wide">
                MargDarshak
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              National crowd-aware destination intelligence and visitor redistribution system built for Smart India Hackathon 2026 (Problem Statement: SIH26204).
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-[11px] text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active State Pilot: Rajasthan (2024–25 Dataset)
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform Modules</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Platform Overview</Link></li>
              <li><Link to="/explore" className="hover:text-amber-400 transition-colors">Destinations Directory (113 Sites)</Link></li>
              <li><Link to="/itinerary" className="hover:text-amber-400 transition-colors text-amber-300 font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Smart Itinerary Planner</Link></li>
              <li><Link to="/explore?crowd=LOW" className="hover:text-amber-400 transition-colors">Live Off-Peak Attractions</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">Data Provenance & Governance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Pilot Circuits Covered</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Jaipur & Amer Fort Corridor</li>
              <li>Udaipur Mewar Lake Circuit</li>
              <li>Jodhpur Marwar Citadel Hub</li>
              <li>Jaisalmer Thar Sand Dunes</li>
              <li>Ranthambore & Hadoti Wildlife Reserve</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Architectural Scope</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Currently piloted on Rajasthan Tourism Department economic census data. The system architecture is built to expand nationally across all Indian states with real-time turnstile API integration.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Shield className="w-4 h-4" /> SIH26204 Compliant Prototype
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 MargDarshak • Smart India Hackathon Prototype (SIH26204).</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">State Pilot: Rajasthan Tourism Data (113 Monuments)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
