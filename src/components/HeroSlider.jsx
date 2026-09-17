import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import CrowdBadge from './CrowdBadge';

const heroSlides = [
  {
    id: 'RJ_AMBER_FORT',
    name: 'Amber Fort & Palace',
    city: 'Jaipur',
    tagline: 'Magnificent Rajput architecture perched upon the rugged Amer hills',
    crowd: 'HIGH',
    capacity: '82%',
    bestTime: '08:00 AM – 10:00 AM',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'RJ_CITY_PALACE_UDAIPUR',
    name: 'City Palace Udaipur',
    city: 'Udaipur',
    tagline: 'The Venetian wonder of Mewar overlooking serene Lake Pichola',
    crowd: 'HIGH',
    capacity: '81%',
    bestTime: '08:00 AM – 10:00 AM',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'RJ_JAISALMER_FORT',
    name: 'Sonar Qila (Golden Fort)',
    city: 'Jaisalmer',
    tagline: 'A living golden sandstone citadel emerging from the Thar desert sands',
    crowd: 'HIGH',
    capacity: '87%',
    bestTime: '08:00 AM – 10:00 AM',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'RJ_MEHRANGARH_FORT',
    name: 'Mehrangarh Fort',
    city: 'Jodhpur',
    tagline: 'Impregnable cliff-top citadel towering 400 feet above the Blue City',
    crowd: 'MODERATE',
    capacity: '68%',
    bestTime: '08:00 AM – 10:30 AM',
    image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'RJ_HAWA_MAHAL',
    name: 'Hawa Mahal (Palace of Winds)',
    city: 'Jaipur',
    tagline: '953 ornate pink sandstone jharokhas catching the desert breeze',
    crowd: 'HIGH',
    capacity: '82%',
    bestTime: '08:00 AM – 10:00 AM',
    image: 'https://images.unsplash.com/photo-1603262110263-fb010d6e59d4?w=1600&auto=format&fit=crop&q=85'
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Auto slide interval (every 5.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const activeSlide = heroSlides[currentSlide];

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] overflow-hidden bg-slate-950">
      {/* Background Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.name}
            className="w-full h-full object-cover"
          />
          {/* JapanTravel style dark gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-black/30"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/50"></div>
        </div>
      ))}

      {/* Main Content Overlay */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-12 pb-14">
        {/* Top Tag & Slide Indicators */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>SIH 2026 Prototype — Crowd Intelligence & Sustainable Tourism</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Center Hero Information */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <CrowdBadge level={activeSlide.crowd} size="md" />
            <span className="text-white/80 text-xs font-semibold bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              {activeSlide.city}, Rajasthan
            </span>
          </div>

          <h1 className="font-serif-title text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            {activeSlide.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-2xl font-normal leading-relaxed">
            {activeSlide.tagline}
          </p>

          <div className="flex items-center gap-4 text-xs text-white/90 pt-1">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity Load</span>
              <strong className="text-amber-300 text-sm font-black">{activeSlide.capacity}</strong>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Recommended Slot</span>
              <strong className="text-white text-sm font-bold">{activeSlide.bestTime}</strong>
            </div>
            <button
              onClick={() => navigate(`/destination/${activeSlide.id}`)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <span>Explore Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Floating Search Bar (JapanTravel/Modern Travel Platform style) */}
        <div className="w-full max-w-3xl pt-4">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/40 flex flex-col sm:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-amber-500/50 transition-all"
          >
            <div className="flex items-center gap-3 flex-1 px-3 w-full">
              <Search className="w-5 h-5 text-amber-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination, fort, wildlife safari, or holy shrine..."
                className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
            >
              <span>Search Crowd</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Slider Arrow Controls */}
          <div className="flex items-center justify-between mt-3 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Trending Sites:</span>
              {['Amber Fort', 'Jaigarh Fort', 'City Palace', 'Khatu Shyam', 'Ranthambore'].map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                  className="hover:text-amber-300 transition-colors bg-white/10 px-2 py-0.5 rounded-md text-[11px] backdrop-blur-xs"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 transition-colors"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 transition-colors"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
