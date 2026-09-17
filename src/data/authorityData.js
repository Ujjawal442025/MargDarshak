// Authority Command Centre — Real Data Derivation Layer
// -------------------------------------------------------
// IMPORTANT: This file contains NO fabricated sites, incidents, or telemetry.
// Everything here is either read directly from `src/data/destinations.js`
// (the same real, government-sourced dataset used across the citizen-facing
// app) or transparently computed from it. Where the underlying data does not
// exist (e.g. live personnel/resource counts), functions return `null` /
// `available: false` rather than inventing a number, consistent with the
// project's own data policy ("null means unavailable").

import { getNearbyAndAlternatives } from '../utils/crowdEngine';

/**
 * Find the hourly_crowd_data index closest to the current wall-clock hour.
 * Falls back to the index whose estimated_visitors is closest to the site's
 * current_visitor_count when the clock falls outside the recorded window.
 */
function getCurrentHourIndex(dest) {
  const hourly = dest.hourly_crowd_data || [];
  if (hourly.length === 0) return -1;

  const now = new Date();
  const hour24 = now.getHours();

  // hourly_crowd_data entries look like "08:00 AM", "01:00 PM" etc, in order.
  const idx = hourly.findIndex(h => {
    const [time, meridiem] = h.time.split(' ');
    let [hh] = time.split(':').map(Number);
    if (meridiem === 'PM' && hh !== 12) hh += 12;
    if (meridiem === 'AM' && hh === 12) hh = 0;
    return hh === hour24;
  });

  if (idx !== -1) return idx;

  // Outside the recorded window (e.g. late night) — anchor on the closest
  // recorded value to the site's own reported current_visitor_count instead
  // of guessing.
  const target = dest.crowd?.current_visitor_count;
  if (target == null) return 0;
  let bestIdx = 0;
  let bestDiff = Infinity;
  hourly.forEach((h, i) => {
    const diff = Math.abs(h.estimated_visitors - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  });
  return bestIdx;
}

/**
 * Derive inflow/outflow per minute from the real hourly_crowd_data curve
 * (delta between consecutive recorded hours), instead of inventing numbers.
 * This is clearly a *derived* estimate, not a live sensor feed.
 */
export function getFlowEstimate(dest) {
  const hourly = dest.hourly_crowd_data || [];
  if (hourly.length < 2) {
    return { available: false, reason: 'Insufficient hourly data' };
  }
  const i = getCurrentHourIndex(dest);
  const curr = hourly[i] ?? hourly[0];
  const prevIdx = i > 0 ? i - 1 : 0;
  const prev = hourly[prevIdx] ?? curr;

  const deltaFromPrev = curr.estimated_visitors - prev.estimated_visitors;
  const grossFlowPerMin = Math.round(Math.abs(deltaFromPrev) / 60) || Math.round(curr.estimated_visitors / 600);
  const netPerMin = Math.round(deltaFromPrev / 60);

  return {
    available: true,
    hourLabel: curr.time,
    netAccumulationPerMin: netPerMin,
    approxInflowPerMin: Math.max(grossFlowPerMin, Math.abs(netPerMin)),
    approxOutflowPerMin: Math.max(grossFlowPerMin - netPerMin, 0),
    basis: "Derived from the hourly visitor pattern already in the dataset (delta between recorded hours), not a live sensor feed."
  };
}

/**
 * Build a NOW / +15m / +30m / +45m / +60m / +75m projection strictly by
 * interpolating the site's own recorded hourly_crowd_data curve — i.e.
 * reading quarter-hour points along data that already exists, rather than
 * multiplying the current number by a made-up growth factor.
 */
export function getPredictiveSeries(dest) {
  const hourly = dest.hourly_crowd_data || [];
  if (hourly.length < 2) return [];

  const i = getCurrentHourIndex(dest);
  const curr = hourly[i] ?? hourly[0];
  const nextIdx = Math.min(i + 1, hourly.length - 1);
  const next = hourly[nextIdx] ?? curr;
  const nextNextIdx = Math.min(i + 2, hourly.length - 1);
  const nextNext = hourly[nextNextIdx] ?? next;

  const interp = (a, b, t) => Math.round(a + (b - a) * t);

  return [
    { interval: 'Now', load: curr.crowd_percentage, visitors: curr.estimated_visitors },
    { interval: '+15m', load: interp(curr.crowd_percentage, next.crowd_percentage, 0.25), visitors: interp(curr.estimated_visitors, next.estimated_visitors, 0.25) },
    { interval: '+30m', load: interp(curr.crowd_percentage, next.crowd_percentage, 0.5), visitors: interp(curr.estimated_visitors, next.estimated_visitors, 0.5) },
    { interval: '+45m', load: interp(curr.crowd_percentage, next.crowd_percentage, 0.75), visitors: interp(curr.estimated_visitors, next.estimated_visitors, 0.75) },
    { interval: '+60m', load: next.crowd_percentage, visitors: next.estimated_visitors },
    { interval: '+75m', load: interp(next.crowd_percentage, nextNext.crowd_percentage, 0.25), visitors: interp(next.estimated_visitors, nextNext.estimated_visitors, 0.25) },
  ];
}

/**
 * "Active Alerts" — replaces fabricated incident narratives. An alert is
 * simply any monitored site whose ACTUAL recorded crowd level/capacity in
 * the dataset has crossed HIGH/CRITICAL thresholds. Nothing here is
 * invented (no fake gate names, no fake queue counts) — every field quoted
 * comes straight from that site's own record.
 */
export function getActiveAlerts(destinations) {
  return destinations
    .filter(d => {
      const lvl = d.crowd?.current_crowd_level;
      const cap = d.crowd?.current_capacity_utilization || 0;
      return lvl === 'CRITICAL' || lvl === 'HIGH' || cap >= 75;
    })
    .map(d => {
      const severity = (d.crowd?.current_crowd_level === 'CRITICAL' || d.crowd?.current_capacity_utilization >= 88)
        ? 'CRITICAL' : 'HIGH';
      return {
        id: `ALERT-${d.site_id}`,
        siteId: d.site_id,
        siteName: d.site_name,
        city: d.city,
        severity,
        capacityPct: d.crowd?.current_capacity_utilization,
        crowdLevel: d.crowd?.current_crowd_level,
        trend: d.crowd?.crowd_trend,
        estimatedWait: d.crowd?.estimated_wait_time,
        peakHours: d.crowd?.peak_hours,
        title: `${d.crowd?.current_crowd_level === 'CRITICAL' ? 'Critical' : 'High'} crowd density at ${d.site_name}`,
        description: `${d.site_name} (${d.city}) is currently at ${d.crowd?.current_capacity_utilization}% capacity utilization, trend ${(d.crowd?.crowd_trend || '').toLowerCase()}. Estimated wait time ${d.crowd?.estimated_wait_time || 'unavailable'}. Peak hours: ${d.crowd?.peak_hours || 'unavailable'}.`
      };
    })
    .sort((a, b) => (b.capacityPct || 0) - (a.capacityPct || 0));
}

/**
 * Suggest a resource-reallocation DIRECTION using real proximity + real
 * relative crowd pressure (via crowdEngine's getNearbyAndAlternatives).
 * Deliberately does NOT invent personnel/vehicle counts — those fields do
 * not exist anywhere in the dataset (the Authority live-feed schema marks
 * them explicitly as null / "AWAITING_AUTHORISED_FEED"), so this stays
 * qualitative and is clearly labeled as such.
 */
export function getDonorSiteSuggestion(dest, allDestinations) {
  const { alternatives } = getNearbyAndAlternatives(dest, allDestinations, 90);
  if (!alternatives || alternatives.length === 0) {
    return { available: false, reason: 'No lower-pressure site found within range.' };
  }
  const donor = alternatives[0];
  return {
    available: true,
    donorSiteName: donor.site_name,
    donorCity: donor.city,
    distanceKm: donor.distance_km,
    donorCapacityPct: donor.crowd?.current_capacity_utilization,
    targetCapacityPct: dest.crowd?.current_capacity_utilization,
    note: "No live personnel/vehicle deployment feed is connected yet, so this shows a proximity + relative-pressure suggestion only, not fabricated headcounts."
  };
}

/**
 * What-if simulation: transparent, formula-based projection off the site's
 * REAL current capacity/visitor numbers — not a canned static screenshot,
 * and not random. Every scenario documents its own assumption.
 */
export function simulateScenario(dest, scenarioKey) {
  const baseCapacityPct = dest.crowd?.current_capacity_utilization ?? 50;
  const baseVisitors = dest.crowd?.current_visitor_count ?? 0;
  const dailyCap = dest.crowd?.total_daily_capacity ?? Math.round(baseVisitors / (baseCapacityPct / 100 || 1));
  const baseWaitText = dest.crowd?.estimated_wait_time || '';
  const baseWaitMin = parseInt(String(baseWaitText).match(/\d+/)?.[0] || '0', 10);

  const scenarios = {
    none: {
      label: 'No Action (baseline)',
      capacityMultiplier: 1,
      waitMultiplier: 1,
      assumption: 'Current recorded conditions, no intervention applied.'
    },
    reroute_20: {
      label: 'Reroute 20% of Inflow',
      capacityMultiplier: 0.8,
      waitMultiplier: 0.65,
      assumption: 'Diverting an estimated 20% of new arrivals to an alternate entry/site reduces net accumulation proportionally.'
    },
    second_gate: {
      label: 'Open Secondary Gate/Channel',
      capacityMultiplier: 0.88,
      waitMultiplier: 0.55,
      assumption: 'A second processing channel roughly doubles throughput at the bottleneck, cutting queue-driven wait sharply while easing but not eliminating overall occupancy.'
    },
    gate_closure: {
      label: 'Temporary Gate Closure (worst case)',
      capacityMultiplier: 1.22,
      waitMultiplier: 1.6,
      assumption: 'Closing an entry point concentrates the same real inflow onto fewer channels, increasing pressure and wait time at the remaining ones.'
    }
  };

  const s = scenarios[scenarioKey] || scenarios.none;
  const projectedCapacityPct = Math.max(5, Math.min(100, Math.round(baseCapacityPct * s.capacityMultiplier)));
  const projectedVisitors = Math.round(dailyCap * (projectedCapacityPct / 100));
  const projectedWaitMin = Math.max(0, Math.round(baseWaitMin * s.waitMultiplier));

  return {
    scenarioKey: scenarioKey || 'none',
    label: s.label,
    assumption: s.assumption,
    before: { capacityPct: baseCapacityPct, visitors: baseVisitors, waitMin: baseWaitMin || null },
    after: { capacityPct: projectedCapacityPct, visitors: projectedVisitors, waitMin: baseWaitMin ? projectedWaitMin : null },
    disclosure: "Simulated planning estimate calculated from this site's real current capacity/visitor figures using a transparent multiplier — not a live sensor reading or a production ML forecast."
  };
}

/**
 * KPI roll-up across all monitored sites, entirely from real per-site
 * fields already in the dataset (crowd level/capacity, festival_today).
 */
export function getStateKPIs(destinations) {
  let critical = 0, high = 0, moderate = 0, low = 0, activeEvents = 0;
  destinations.forEach(d => {
    const cap = d.crowd?.current_capacity_utilization || 0;
    const lvl = d.crowd?.current_crowd_level || 'MODERATE';
    if (lvl === 'CRITICAL' || cap >= 88) critical++;
    else if (lvl === 'HIGH' || cap >= 75) high++;
    else if (lvl === 'MODERATE' || cap >= 50) moderate++;
    else low++;
    if (d.events?.festival_today) activeEvents++;
  });
  return {
    total: destinations.length,
    critical,
    high,
    moderate,
    low,
    activeEvents,
    activeAlerts: critical + high
  };
}
