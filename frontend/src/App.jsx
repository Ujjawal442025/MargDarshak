import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SearchResultsPage from './pages/SearchResultsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import ItineraryPlannerPage from './pages/ItineraryPlannerPage';
import AboutPage from './pages/AboutPage';
import AuthorityCommandCenter from './pages/AuthorityCommandCenter';
import AuthorityLoginGate, { isAuthoritySessionActive } from './components/AuthorityLoginGate';

// Gatekeeper for the /authority route: shows the fake-credential login
// screen until a valid (demo) session is set, then renders the real
// Command Center. See AuthorityLoginGate.jsx for the "this is not real
// security" disclaimer.
function ProtectedAuthorityRoute() {
  const [authenticated, setAuthenticated] = useState(isAuthoritySessionActive());

  useEffect(() => {
    setAuthenticated(isAuthoritySessionActive());
  }, []);

  if (!authenticated) {
    return <AuthorityLoginGate onAuthenticated={() => setAuthenticated(true)} />;
  }
  return <AuthorityCommandCenter onLogout={() => setAuthenticated(false)} />;
}

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
          <Route path="/authority" element={<ProtectedAuthorityRoute />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
