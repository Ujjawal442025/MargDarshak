export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getNearbyAndAlternatives(currentSite, allDestinations, maxDistanceKm = 70) {
  if (!currentSite) return { nearby: [], alternatives: [] };

  const destinationsWithDistance = allDestinations
    .filter((d) => d.site_id !== currentSite.site_id)
    .map((d) => {
      const dist = calculateDistance(
        currentSite.latitude,
        currentSite.longitude,
        d.latitude,
        d.longitude
      );
      return { ...d, distance_km: dist };
    })
    .sort((a, b) => a.distance_km - b.distance_km);

  const nearby = destinationsWithDistance.filter((d) => d.distance_km <= maxDistanceKm);

  const crowdTier = { LOW: 1, MODERATE: 2, HIGH: 3, CRITICAL: 4 };
  const currentTier = crowdTier[currentSite.crowd.current_crowd_level] || 2;

  const alternatives = nearby
    .filter((d) => {
      const dTier = crowdTier[d.crowd.current_crowd_level] || 2;
      return dTier < currentTier;
    })
    .slice(0, 3);

  if (alternatives.length === 0 && nearby.length > 0) {
    const sortedByScore = [...nearby].sort(
      (a, b) => b.recommendation.overall_visit_score - a.recommendation.overall_visit_score
    );
    alternatives.push(...sortedByScore.slice(0, 2));
  }

  return {
    nearby: nearby.slice(0, 6),
    alternatives,
  };
}

export function searchDestinations(destinations, query, filters = {}) {
  if (!query && Object.keys(filters).length === 0) return destinations;
  const q = (query || '').toLowerCase().trim();

  return destinations.filter((dest) => {
    const matchesText =
      !q ||
      dest.site_name.toLowerCase().includes(q) ||
      dest.city.toLowerCase().includes(q) ||
      dest.district.toLowerCase().includes(q) ||
      dest.category.toLowerCase().includes(q) ||
      dest.sub_category.toLowerCase().includes(q) ||
      dest.description.toLowerCase().includes(q);

    if (!matchesText) return false;

    if (filters.crowdLevel && filters.crowdLevel !== 'ALL') {
      if (dest.crowd.current_crowd_level !== filters.crowdLevel) return false;
    }

    if (filters.category && filters.category !== 'ALL') {
      if (dest.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    }

    if (filters.city && filters.city !== 'ALL') {
      if (dest.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    }

    return true;
  });
}
