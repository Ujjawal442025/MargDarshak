// Approximate coordinates for the craft hubs in craftsData.js.
// crafts.csv has no lat/lng, so we map each craft's city / district to the
// centre of that craft town. Accurate to the town, not to the workshop door.
const CITY_COORDS = {
  "Ajmer / Kishangarh": [26.586, 74.864],
  "Bagru (Jaipur)": [26.811, 75.546],
  Barmer: [25.7532, 71.4181],
  Bharatpur: [27.2152, 77.503],
  Bhilwara: [25.3407, 74.6313],
  Bikaner: [28.0229, 73.3119],
  Bundi: [25.4305, 75.6499],
  Dholpur: [26.7025, 77.893],
  Jaipur: [26.9124, 75.7873],
  Jaisalmer: [26.9157, 70.9083],
  "Jhunjhunu (Shekhawati)": [28.1289, 75.398],
  Jodhpur: [26.2389, 73.0243],
  Kota: [25.2138, 75.8648],
  "Molela (Rajsamand)": [24.982, 73.856],
  Nagaur: [27.202, 73.7339],
  "Nathdwara (Rajsamand)": [24.938, 73.823],
  Pali: [25.7711, 73.3234],
  Pratapgarh: [24.0316, 74.777],
  "Sanganer (Jaipur)": [26.8206, 75.796],
  "Sawai Madhopur": [26.0173, 76.3441],
  Udaipur: [24.5854, 73.7125],
};

const DISTRICT_COORDS = {
  ajmer: [26.4499, 74.6399],
  barmer: [25.7532, 71.4181],
  bharatpur: [27.2152, 77.503],
  bhilwara: [25.3407, 74.6313],
  bikaner: [28.0229, 73.3119],
  bundi: [25.4305, 75.6499],
  dholpur: [26.7025, 77.893],
  jaipur: [26.9124, 75.7873],
  jaisalmer: [26.9157, 70.9083],
  jhunjhunu: [28.1289, 75.398],
  jodhpur: [26.2389, 73.0243],
  kota: [25.2138, 75.8648],
  nagaur: [27.202, 73.7339],
  pali: [25.7711, 73.3234],
  pratapgarh: [24.0316, 74.777],
  rajsamand: [25.0714, 73.8797],
  sawai: [26.0173, 76.3441],
  udaipur: [24.5854, 73.7125],
};

// Returns { lat, lng, precision } for a craft record.
export function getCraftCoords(craft) {
  if (craft.latitude && craft.longitude) {
    return { lat: craft.latitude, lng: craft.longitude, precision: "exact" };
  }
  const byCity = CITY_COORDS[craft.city];
  if (byCity) return { lat: byCity[0], lng: byCity[1], precision: "town" };
  const key = (craft.district || "").toLowerCase().split(" ")[0];
  const byDistrict = DISTRICT_COORDS[key];
  if (byDistrict) {
    return { lat: byDistrict[0], lng: byDistrict[1], precision: "district" };
  }
  return { lat: 26.9124, lng: 75.7873, precision: "district" };
}
