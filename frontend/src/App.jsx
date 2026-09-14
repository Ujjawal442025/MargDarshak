import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SearchResultsPage from './pages/SearchResultsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import ItineraryPlannerPage from './pages/ItineraryPlannerPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/destination/:siteId" element={<DestinationDetailPage />} />
          <Route path="/itinerary" element={<ItineraryPlannerPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
