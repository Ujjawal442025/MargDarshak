import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function PredictionChart({ prediction, siteName }) {
  if (!prediction) return null;

  const data = [
    {
      day: "Today's Est.",
      visitors: prediction.today_visitors_est || 3800,
      crowd: prediction.predicted_crowd_today || 'HIGH',
      color: prediction.predicted_crowd_today === 'HIGH' ? '#f97316' : '#10b981'
    },
    {
      day: "Tomorrow's Est.",
      visitors: prediction.tomorrow_visitors_est || 4250,
      crowd: prediction.predicted_crowd_tomorrow || 'HIGH',
      color: '#6366f1'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Predictive Crowd Intelligence</h3>
            <p className="text-[11px] text-slate-500">Multivariate model calibrated on {prediction.historical_data_days} days history</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" /> Confidence: {prediction.prediction_confidence}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Anticipated Peak</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{prediction.predicted_peak_time}</p>
            </div>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">High Load</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Anticipated Low Crowd</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{prediction.predicted_low_crowd_time}</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Fast Entry</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val) => [`${val.toLocaleString()} Visitors`, 'Estimate']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="visitors" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
