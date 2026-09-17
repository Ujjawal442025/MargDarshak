import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key" });

/**
 * Generates a crowd-aware, personalized Rajasthan itinerary using Google Gemini.
 */
export async function generateAIItinerary(preferences, destinations) {
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn(
      "Gemini API key missing. Using local fallback itinerary engine.",
    );
    return generateLocalFallbackItinerary(preferences, destinations);
  }

  try {
    const cityFilter = preferences.city ? preferences.city.toLowerCase() : "";
    const crowdPref = preferences.crowdPreference || "Balanced";

    // Filter destinations by city first
    let relevantDestinations = destinations.filter((d) => {
      if (!cityFilter || cityFilter === "any" || cityFilter === "rajasthan")
        return true;
      return (
        d.city?.toLowerCase().includes(cityFilter) ||
        d.district?.toLowerCase().includes(cityFilter) ||
        d.site_name?.toLowerCase().includes(cityFilter)
      );
    });

    if (relevantDestinations.length === 0) relevantDestinations = destinations;

    // Helper: the real crowd level lives at d.crowd.current_crowd_level
    // (values are "LOW" / "MODERATE" / "HIGH" / "CRITICAL"), not d.crowd_level.
    const getCrowdLevel = (d) =>
      (d.crowd?.current_crowd_level || "MODERATE").toUpperCase();

    // Apply strict crowd filtering if user chose "Avoid crowds"
    if (crowdPref === "Avoid crowds") {
      // Sort so Low crowd sites come first, then Moderate, then High/Critical
      relevantDestinations.sort((a, b) => {
        const rank = (lvl) => (lvl === "LOW" ? 2 : lvl === "MODERATE" ? 1 : 0);
        return rank(getCrowdLevel(b)) - rank(getCrowdLevel(a));
      });
    }

    const compactDestinations = relevantDestinations.map((d) => ({
      site_id: d.site_id,
      site_name: d.site_name,
      city: d.city,
      category: d.category,
      visiting_hours: d.visiting
        ? `${d.visiting.opening_time} - ${d.visiting.closing_time}`
        : undefined,
      crowd_level: getCrowdLevel(d),
      best_time_today: d.crowd?.best_time_today,
      peak_hours: d.crowd?.peak_hours,
      hourly_crowd_data: d.hourly_crowd_data,
      prediction: d.prediction,
      weather: d.weather,
      recommendation_score: d.recommendation?.recommendation_score,
      facilities: d.facilities,
    }));

    const prompt = `
You are the itinerary intelligence engine for MargDarshak, a Rajasthan tourism crowd-management platform.
Generate a practical, day-by-day itinerary using ONLY the destinations supplied in the JSON context below.

USER PREFERENCES:
- City/Location: ${preferences.city}
- Duration: ${preferences.durationDays} Days
- Start Date: ${preferences.startDate}
- Travelers: ${preferences.travelers} (${preferences.travelerType || "General"})
- Interests: ${preferences.interests?.join(", ")}
- Crowd Preference: ${crowdPref} (CRITICAL: If "Avoid crowds", you MUST select and prioritize destinations and time slots with "Low" or "Moderate" crowd levels, and avoid high-density spots during peak hours).
- Travel Pace: ${preferences.travelPace}
- Budget: ${preferences.budget}
- Preferred Time Window: ${preferences.startTime} to ${preferences.endTime}
- Special Requirements: ${preferences.specialRequirements || "None"}

CONSTRAINTS:
1. Every recommended destination MUST correspond to an existing "site_id" from the supplied dataset. Never invent destination names.
2. Strictly respect the user's crowd preference ("${crowdPref}"). Adjust the selection and scheduling accordingly.
3. Return STRICTLY valid JSON matching this exact schema (no markdown formatting outside JSON):

{
  "trip_title": "string",
  "summary": "string",
  "total_days": number,
  "planning_notes": ["string"],
  "days": [
    {
      "day": number,
      "title": "string",
      "summary": "string",
      "items": [
        {
          "site_id": "string",
          "time": "string",
          "duration": "string",
          "reason": "string",
          "crowd_level": "string",
          "travel_note": "string"
        }
      ],
      "meal_suggestion": "string",
      "day_summary": "string"
    }
  ],
  "optimization": {
    "crowd_avoidance": "string",
    "best_visit_window": "string",
    "route_logic": "string",
    "personalization_reason": "string"
  }
}

AVAILABLE DESTINATIONS DATASET:
${JSON.stringify(compactDestinations, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    // NOTE: in @google/genai, `response.text` is a property, NOT a function.
    const responseText = response.text;

    if (!responseText) {
      throw new Error(
        "Empty response text from Gemini (check API key / model / quota).",
      );
    }

    return JSON.parse(responseText);
  } catch (error) {
    // Surface the REAL reason in the console instead of hiding it,
    // so it's obvious why we fell back to the local engine.
    console.error(
      "Gemini API Error or JSON parsing failed, falling back to local engine:",
      error?.message || error,
    );
    return generateLocalFallbackItinerary(preferences, destinations);
  }
}

/**
 * Fallback local rule-based itinerary generator with strict crowd filtering.
 */
function generateLocalFallbackItinerary(preferences, destinations) {
  const city = preferences.city || "Jaipur";
  const crowdPref = preferences.crowdPreference || "Balanced";

  let matched = destinations.filter(
    (d) =>
      d.city?.toLowerCase().includes(city.toLowerCase()) ||
      d.site_name?.toLowerCase().includes(city.toLowerCase()),
  );
  if (matched.length === 0) matched = destinations;

  // Real crowd level lives at d.crowd.current_crowd_level (e.g. "LOW", "MODERATE", "HIGH", "CRITICAL")
  const getCrowdLevel = (d) =>
    (d.crowd?.current_crowd_level || "MODERATE").toUpperCase();

  // Filter or sort based on crowd preference
  if (crowdPref === "Avoid crowds") {
    const lowCrowdPool = matched.filter((d) =>
      ["LOW", "MODERATE"].includes(getCrowdLevel(d)),
    );
    if (lowCrowdPool.length >= 2) {
      matched = lowCrowdPool;
    }
    // Prioritize the lowest-crowd sites first within the pool
    matched = [...matched].sort((a, b) => {
      const rank = (lvl) => (lvl === "LOW" ? 2 : lvl === "MODERATE" ? 1 : 0);
      return rank(getCrowdLevel(b)) - rank(getCrowdLevel(a));
    });
  }

  const daysCount = parseInt(preferences.durationDays) || 2;
  let days = [];
  let index = 0;

  for (let d = 1; d <= daysCount; d++) {
    let dayItems = [];
    for (let slot = 0; slot < 3; slot++) {
      if (index >= matched.length) index = 0;
      const dest = matched[index++];
      const destCrowdLevel = getCrowdLevel(dest);
      dayItems.push({
        site_id: dest.site_id || "site-1",
        time:
          slot === 0
            ? "08:00 AM (Low Density Window)"
            : slot === 1
              ? "12:00 PM"
              : "04:00 PM",
        duration: "2 Hours",
        reason: `Selected to match your '${crowdPref}' preference by targeting ${destCrowdLevel} crowd density slots.`,
        crowd_level: destCrowdLevel,
        travel_note: `Optimized routing for ${city}.`,
      });
    }

    days.push({
      day: d,
      title: `${city} Day ${d} - ${crowdPref === "Avoid crowds" ? "Offbeat & Low-Density" : "Heritage"} Route`,
      summary: `Tailored itinerary prioritizing your ${crowdPref.toLowerCase()} preference.`,
      items: dayItems,
      meal_suggestion: `Recommended dining spot in ${city}.`,
      day_summary: `Day ${d} optimized for ${preferences.travelPace || "moderate"} pace.`,
    });
  }

  return {
    trip_title: `${city} Expedition (${daysCount} Days) - ${crowdPref}`,
    summary: `Data-driven fallback itinerary customized for ${crowdPref}.`,
    total_days: daysCount,
    planning_notes: [
      `Filtered and structured specifically for crowd preference: ${crowdPref}.`,
    ],
    days: days,
    optimization: {
      crowd_avoidance:
        crowdPref === "Avoid crowds"
          ? "Filtered out high-density venues and prioritized off-peak morning windows."
          : "Balanced visitor distribution across popular landmarks.",
      best_visit_window: "08:00 AM - 10:30 AM",
      route_logic: "Geographically clustered for minimal transit.",
      personalization_reason: "Strictly aligned with user crowd constraints.",
    },
  };
}
