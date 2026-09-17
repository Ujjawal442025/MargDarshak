import React from 'react';
import { Sun, CloudRain, Wind, Droplets } from 'lucide-react';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Destination Weather & Comfort</span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">Atmospheric Conditions</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-slate-900">{weather.temperature}°C</span>
          <Sun className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" /> Rain Prob.
          </div>
          <p className="text-sm font-bold text-slate-800">{weather.rain_probability}</p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-500" /> Humidity
          </div>
          <p className="text-sm font-bold text-slate-800">{weather.humidity}</p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-500" /> Wind Speed
          </div>
          <p className="text-sm font-bold text-slate-800">{weather.wind_speed}</p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-600" /> UV Index
          </div>
          <p className="text-sm font-bold text-slate-800">{weather.uv_index}</p>
        </div>
      </div>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/70 flex items-center justify-between text-xs">
        <span className="font-semibold text-emerald-800">
          Outdoor Suitability: <strong>{weather.outdoor_suitability}</strong>
        </span>
        <span className="bg-emerald-200/70 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
          Comfort Score: {weather.weather_comfort_score}/100
        </span>
      </div>
    </div>
  );
}
