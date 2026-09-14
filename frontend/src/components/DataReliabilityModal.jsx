import React from 'react';
import { ShieldCheck, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DataReliabilityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Data Provenance & Methodology</h2>
              <p className="text-xs text-slate-500">SIH 2026 Architectural Compliance Statement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-600">
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80">
            <h4 className="font-bold text-amber-900 flex items-center gap-2 text-sm mb-1">
              <Database className="w-4 h-4 text-amber-700" />
              Primary Source: Rajasthan Tourism Official Data 2024-25
            </h4>
            <p className="text-amber-950/90">
              All tourist destinations, municipal district associations, classifications, entry tariffs, and baseline annual visitor counts are extracted directly from the Government of Rajasthan Tourism Department records.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Transparency Protocol: Synthetic Prototype Telemetry</h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Hourly Profiles & Instant Load:</strong> Simulated prototype values calibrated to historical tourist surge patterns (8:00 AM – 8:00 PM). These values are deterministic for hackathon evaluation and clearly demarcated.
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Pluggable IoT / API Architecture:</strong> Designed with dedicated service hooks. State e-mitra ticketing gateways, automated turnstile sensors, or CCTV optical visitor counters can replace the synthetic data layer instantly via standard JSON endpoints.
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Understood & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
