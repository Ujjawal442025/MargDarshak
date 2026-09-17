import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const crowdColor =
      data.crowd_percentage > 75
        ? 'text-rose-600 font-bold'
        : (data.crowd_percentage > 45 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold');

    return (
      <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
        <div className="flex items-center justify-between gap-4 font-bold border-b border-slate-800 pb-1">
          <span>{label}</span>
          <span className="text-amber-400">{data.crowd_level}</span>
        </div>
        <p className="text-slate-300">
          Est. Visitors: <strong className="text-white">{data.estimated_visitors?.toLocaleString()}</strong>
        </p>
        <p className="text-slate-300">
          Crowd Pressure: <span className={crowdColor}>{data.crowd_percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function HourlyCrowdChart({ hourlyData, bestTime }) {
  const [activeMetric, setActiveMetric] = useState('percentage');

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400">
        Hourly crowd telemetry unavailable.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">Hourly Crowd Fluctuation</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modelled hourly ingress & dwell volume from 08:00 AM to 08:00 PM
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('percentage')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeMetric === 'percentage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Crowd %
          </button>
          <button
            onClick={() => setActiveMetric('visitors')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeMetric === 'visitors'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visitor Inflow
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="crowdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.replace(':00 ', ' ')}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
              tickFormatter={(v) => (activeMetric === 'percentage' ? `${v}%` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric === 'percentage' ? 'crowd_percentage' : 'estimated_visitors'}
              stroke="#d97706"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#crowdGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {bestTime && (
        <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
          <span className="text-amber-900 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-700" /> Optimal Visiting Window Today:
          </span>
          <span className="font-bold text-amber-950 bg-amber-200/60 px-2.5 py-0.5 rounded-md">
            {bestTime}
          </span>
        </div>
      )}
    </div>
  );
}
