import React from 'react';
import { Shield, Database, Cpu, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <Shield className="w-3.5 h-3.5" /> SIH26204 Technical Documentation
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-black text-slate-900">
          Crowd-Aware Tourism Platform Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          Solving over-tourism at Rajasthan heritage hotspots through predictive flow modeling and automated proximity redistribution.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600" />
          1. Rajasthan Tourism Data Processing (2024-25)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The dataset powers destination entities directly from the Rajasthan Government Tourism records. Key monuments across Jaipur, Jodhpur, Udaipur, Jaisalmer, Ajmer, Kota, and Bundi have been normalized with exact geographic coordinates, classifications, entry tariffs, and municipal districts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          2. Synthetic vs Live Feeds
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          In full accordance with hackathon guidelines, all hourly visitor graphs, capacity meters, and short-term forecast metrics are clearly labeled as synthetic prototype models. They model real-world tourist surges without misrepresenting live government surveillance or CCTV streams.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          3. How to Plug in Real-Time APIs in Production
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The codebase is modularized. To convert this prototype into a state-level production application:
        </p>
        <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
          <li>Replace <code>src/data/destinations.js</code> with an async fetch against the Rajasthan SSO / Archaeology Dept API.</li>
          <li>Connect automated turnstile gate counters to the <code>CapacityMeter</code> component.</li>
          <li>Subscribe the <code>WeatherCard</code> component to the India Meteorological Department (IMD) district radar API.</li>
        </ul>
      </div>
    </div>
  );
}
