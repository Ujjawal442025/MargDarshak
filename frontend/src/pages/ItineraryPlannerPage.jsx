import React, { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Clock,
  Compass,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Navigation,
  Trash2,
  Award,
} from "lucide-react";
import { destinations } from "../data/destinations";
import { generateAIItinerary } from "../services/geminiService";
import CrowdBadge from "../components/CrowdBadge";
import { useNavigate } from "react-router-dom";
import { useTripCrafts, removeTripCraft, clearTripCrafts } from "../utils/tripStore";

export default function ItineraryPlannerPage() {
  const navigate = useNavigate();
  const savedCrafts = useTripCrafts();

  // Form State (Persisted in sessionStorage)
  const [city, setCity] = useState(
    () => sessionStorage.getItem("marg_city") || "Jaipur",
  );
  const [durationDays, setDurationDays] = useState(
    () => Number(sessionStorage.getItem("marg_duration")) || 2,
  );
  const [startDate, setStartDate] = useState(
    () =>
      sessionStorage.getItem("marg_date") ||
      new Date().toISOString().split("T")[0],
  );
  const [travelers, setTravelers] = useState(
    () => Number(sessionStorage.getItem("marg_travelers")) || 2,
  );
  const [travelerType, setTravelerType] = useState("Family");
  const [selectedInterests, setSelectedInterests] = useState([
    "Heritage",
    "Photography",
    "Culture",
  ]);
  const [crowdPreference, setCrowdPreference] = useState("Avoid crowds");
  const [travelPace, setTravelPace] = useState("Moderate");
  const [budget, setBudget] = useState("Moderate");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Itinerary Result State
  const [itinerary, setItinerary] = useState(() => {
    const saved = sessionStorage.getItem("marg_cached_itinerary");
    return saved ? JSON.parse(saved) : null;
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("marg_city", city);
    sessionStorage.setItem("marg_duration", durationDays);
    sessionStorage.setItem("marg_date", startDate);
    sessionStorage.setItem("marg_travelers", travelers);
  }, [city, durationDays, startDate, travelers]);

  useEffect(() => {
    if (itinerary) {
      sessionStorage.setItem(
        "marg_cached_itinerary",
        JSON.stringify(itinerary),
      );
    } else {
      sessionStorage.removeItem("marg_cached_itinerary");
    }
  }, [itinerary]);

  const interestOptions = [
    "Heritage",
    "Photography",
    "Culture",
    "Food",
    "Nature",
    "Shopping",
    "Religious",
    "Adventure",
    "Family",
    "Architecture",
  ];

  const loadingMessages = [
    "AI is analyzing Rajasthan destinations...",
    "Checking real-time crowd patterns & hourly density...",
    "Optimizing route sequence & travel distances...",
    "Building your personalized day-by-day plan...",
  ];

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev,
      );
    }, 800);

    try {
      const preferences = {
        city,
        durationDays,
        startDate,
        travelers,
        travelerType,
        interests: selectedInterests,
        crowdPreference,
        travelPace,
        budget,
        startTime,
        endTime,
        specialRequirements,
        savedCrafts,
      };

      const result = await generateAIItinerary(preferences, destinations);
      clearInterval(interval);
      setItinerary(result);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setError(
        "Unable to generate your itinerary right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDestinationDetails = (siteId) => {
    return destinations.find((d) => d.site_id === siteId) || destinations[0];
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 relative pb-20">
      {/* Fixed, Blurry, Low-Opacity Rajasthan Background Watermark (Doesn't scroll with page) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center filter blur-[1px] opacity-[0.3]"
        style={{
          backgroundImage: `url('https://cdn.britannica.com/25/242225-050-72142DF7/Front-facade-of-Palace-of-the-Winds-Hawa-Mahal-Jaipur-Rajasthan-India.jpg')`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            MargDarshak AI Intelligence Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Plan Your Rajasthan Journey with AI
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Tell us how you want to travel. MargDarshak uses destination, crowd,
            timing and preference data to build your itinerary.
          </p>
        </div>

        {/* AI Input Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 mb-12">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> Destination /
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Jaipur">Jaipur</option>
                  <option value="Jodhpur">Jodhpur</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Jaisalmer">Jaisalmer</option>
                  <option value="Ajmer">Ajmer</option>
                  <option value="Pushkar">Pushkar</option>
                  <option value="Rajasthan">All Rajasthan / Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Duration
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={1}>1 Day</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" /> Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Crowd Preference
                </label>
                <select
                  value={crowdPreference}
                  onChange={(e) => setCrowdPreference(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Avoid crowds">Avoid crowds</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Crowds don't matter">
                    Crowds don't matter
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Travel Pace
                </label>
                <select
                  value={travelPace}
                  onChange={(e) => setTravelPace(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Relaxed">Relaxed</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Packed">Packed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Budget Level
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Budget">Budget</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Special Requirements (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Traveling with parents, avoid long walking routes, wheelchair accessible..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                    <span>Planning Your Journey...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Generate AI Itinerary</span>
                  </>
                )}
              </button>

              {itinerary && (
                <button
                  type="button"
                  onClick={() => {
                    setItinerary(null);
                    sessionStorage.removeItem("marg_cached_itinerary");
                  }}
                  className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition"
                >
                  Clear Plan
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-10 text-center max-w-xl mx-auto mb-12 animate-pulse">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              MargDarshak Intelligence at Work
            </h3>
            <p className="text-blue-600 font-medium text-sm transition-all duration-500">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-xl mx-auto mb-12">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-medium mb-4">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Retry Generation
            </button>
          </div>
        )}

        {/* Crafts the user added from destination pages */}
        {savedCrafts.length > 0 && (
          <div className="mb-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  Artisan Shopping Stops
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-2">
                  Crafts in Your Trip ({savedCrafts.length})
                </h2>
              </div>
              <button
                onClick={clearTripCrafts}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCrafts.map((craft) => (
                <div
                  key={craft.craft_id}
                  className="flex gap-3 bg-amber-50/50 border border-amber-200/80 rounded-xl p-3"
                >
                  {craft.image && (
                    <img
                      src={craft.image}
                      alt={craft.craft_name}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {craft.craft_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {craft.city || craft.district}
                    </p>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Best time: {craft.best_time_to_shop}
                    </p>
                    {craft.added_from_site_id && (
                      <button
                        onClick={() =>
                          navigate(`/directions/${craft.added_from_site_id}/${craft.craft_id}`)
                        }
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                      >
                        <Navigation className="w-3 h-3" /> Directions from {craft.added_from}
                      </button>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {craft.gi_tagged && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800">
                          <Award className="w-3 h-3" /> GI
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-slate-700">
                        {craft.price_range}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTripCraft(craft.craft_id)}
                    className="self-start p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    aria-label={`Remove ${craft.craft_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Result */}
        {itinerary && !loading && (
          <div className="space-y-10 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    AI-Optimized Itinerary (Saved in Session)
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                    {itinerary.trip_title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Print / Save
                  </button>
                </div>
              </div>

              <p className="text-slate-600 text-base mb-6 leading-relaxed">
                {itinerary.summary}
              </p>

              {itinerary.optimization && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">
                        Crowd Avoidance
                      </strong>
                      <span className="text-slate-600">
                        {itinerary.optimization.crowd_avoidance}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">
                        Best Visit Window
                      </strong>
                      <span className="text-slate-600">
                        {itinerary.optimization.best_visit_window}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">
                        Route Logic
                      </strong>
                      <span className="text-slate-600">
                        {itinerary.optimization.route_logic}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {itinerary.days?.map((dayObj) => (
              <div
                key={dayObj.day}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-900 text-white p-6 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Day {dayObj.day}
                    </span>
                    <h3 className="text-xl font-bold">{dayObj.title}</h3>
                  </div>
                  <p className="text-slate-300 text-sm max-w-md">
                    {dayObj.summary}
                  </p>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {dayObj.items?.map((item, idx) => {
                    const destData = getDestinationDetails(item.site_id);
                    return (
                      <div
                        key={idx}
                        className="relative pl-6 md:pl-8 border-l-2 border-blue-200 last:border-0 pb-8 last:pb-0"
                      >
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />

                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 md:p-6 hover:shadow-md transition">
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            {destData.image && (
                              <img
                                src={destData.image}
                                alt={destData.site_name}
                                className="w-full md:w-48 h-36 object-cover rounded-lg shadow-sm"
                              />
                            )}

                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                  {item.time} ({item.duration})
                                </span>
                                <CrowdBadge
                                  level={
                                    item.crowd_level || destData.crowd_level
                                  }
                                />
                              </div>

                              <h4 className="text-xl font-bold text-slate-900 mb-1">
                                {destData.site_name || item.site_id}
                              </h4>

                              <p className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />{" "}
                                {destData.city || city} •{" "}
                                {destData.category || "Heritage Landmark"}
                              </p>

                              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 mb-4">
                                <strong className="text-blue-700 block mb-0.5">
                                  Why AI Selected This Slot:
                                </strong>
                                {item.reason}
                              </div>

                              {item.travel_note && (
                                <p className="text-xs text-slate-600 italic mb-4">
                                  💡 <strong>Travel Note:</strong>{" "}
                                  {item.travel_note}
                                </p>
                              )}

                              <button
                                onClick={() =>
                                  navigate(`/destination/${destData.site_id}`)
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                              >
                                View Destination{" "}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {dayObj.meal_suggestion && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-center gap-3">
                      <span className="text-xl">🍲</span>
                      <div>
                        <strong className="block font-bold text-amber-950 mb-0.5">
                          Recommended Meal Stop
                        </strong>
                        {dayObj.meal_suggestion}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
