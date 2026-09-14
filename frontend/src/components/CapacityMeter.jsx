import React from 'react';

export default function CapacityMeter({ utilizationPct, totalCapacity, currentVisitors }) {
  const pct = Math.min(100, Math.max(0, Math.round(utilizationPct || 50)));

  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-700";
  let statusText = "Ample Capacity";

  if (pct >= 85) {
    barColor = "bg-rose-500";
    textColor = "text-rose-700";
    statusText = "Near Full Capacity";
  } else if (pct >= 70) {
    barColor = "bg-orange-500";
    textColor = "text-orange-700";
    statusText = "Heavy Inflow";
  } else if (pct >= 45) {
    barColor = "bg-amber-500";
    textColor = "text-amber-700";
    statusText = "Steady Flow";
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Capacity Utilization</span>
          <p className="text-xs text-slate-400 mt-0.5">Real-time gate ingress vs destination footprint</p>
        </div>
        <span className={`text-2xl font-black ${textColor}`}>
          {pct}%
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/70">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Status: <strong className="text-slate-800">{statusText}</strong></span>
        </div>
        {totalCapacity && (
          <span className="text-slate-500 font-medium">
            ~{currentVisitors?.toLocaleString() || '3,400'} / {totalCapacity.toLocaleString()} max daily cap
          </span>
        )}
      </div>
    </div>
  );
}
