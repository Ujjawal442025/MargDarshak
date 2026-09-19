// Tiny shared store for crafts the user adds to their trip.
// Persists in localStorage and notifies every listener (modal, itinerary page)
// through a custom event, so they stay in sync without a context provider.
const KEY = "marg_trip_crafts";
const EVENT = "marg:trip-crafts-changed";

export function getTripCrafts() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save trip crafts", e);
  }
  window.dispatchEvent(new Event(EVENT));
}

export function isCraftInTrip(craftId) {
  return getTripCrafts().some((c) => c.craft_id === craftId);
}

// Returns true if the craft is now in the trip, false if it was removed.
export function toggleTripCraft(craft, destinationName, siteId) {
  const list = getTripCrafts();
  if (list.some((c) => c.craft_id === craft.craft_id)) {
    save(list.filter((c) => c.craft_id !== craft.craft_id));
    return false;
  }
  save([
    ...list,
    { ...craft, added_from: destinationName || craft.city || "", added_from_site_id: siteId || "" },
  ]);
  return true;
}

export function removeTripCraft(craftId) {
  save(getTripCrafts().filter((c) => c.craft_id !== craftId));
}

export function clearTripCrafts() {
  save([]);
}

// React hook: re-renders whenever the list changes (even from another tab).
import { useState, useEffect } from "react";
export function useTripCrafts() {
  const [crafts, setCrafts] = useState(getTripCrafts);
  useEffect(() => {
    const sync = () => setCrafts(getTripCrafts());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return crafts;
}
