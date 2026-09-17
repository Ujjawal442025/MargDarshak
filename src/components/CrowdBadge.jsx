import React from 'react';

export default function CrowdBadge({ level, size = "md" }) {
  const normalized = (level || 'MODERATE').toUpperCase();

  const configs = {
    LOW: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Low Crowd',
    },
    MODERATE: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      label: 'Moderate',
    },
    HIGH: {
      bg: 'bg-orange-50 border-orange-200 text-orange-700',
      dot: 'bg-orange-500',
      label: 'High Crowd',
    },
    CRITICAL: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-500',
      label: 'Critical Rush',
    }
  };

  const current = configs[normalized] || configs.MODERATE;

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[11px] gap-1.5"
    : (size === "lg" ? "px-3.5 py-1.5 text-sm gap-2" : "px-2.5 py-1 text-xs gap-1.5");

  return (
    <span className={`inline-flex items-center font-bold tracking-tight rounded-full border ${current.bg} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${current.dot} shrink-0 animate-pulse`}></span>
      <span>{current.label}</span>
    </span>
  );
}
