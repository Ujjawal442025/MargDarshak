import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function SatelliteMapView({ destinations, selectedSiteId, onSelectSite, mapFilter, mapLayer, setMapLayer }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Tile layer configurations
  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Rajasthan: approx 26.9124, 75.7873 (Jaipur / Central Rajasthan)
      const map = L.map(mapContainerRef.current, {
        center: [26.85, 74.5],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add default tile layer
      const layerConfig = tileLayers[mapLayer] || tileLayers.satellite;
      const tile = L.tileLayer(layerConfig.url, {
        maxZoom: 18,
        attribution: layerConfig.attribution
      }).addTo(map);

      mapInstanceRef.current = map;
      mapInstanceRef.current._currentTileLayer = tile;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer change (Satellite vs Topo vs Street)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (map._currentTileLayer) {
      map.removeLayer(map._currentTileLayer);
    }

    const layerConfig = tileLayers[mapLayer] || tileLayers.satellite;
    const newTile = L.tileLayer(layerConfig.url, {
      maxZoom: 18,
      attribution: layerConfig.attribution
    }).addTo(map);

    map._currentTileLayer = newTile;
  }, [mapLayer]);

  // Update Markers when destinations or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !destinations) return;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Filter destinations
    const filtered = destinations.filter(d => {
      if (mapFilter === 'ALL') return true;
      if (mapFilter === 'CRITICAL') return d.crowd?.current_crowd_level === 'CRITICAL' || d.crowd?.current_capacity_utilization >= 85;
      if (mapFilter === 'HIGH') return d.crowd?.current_crowd_level === 'HIGH' || (d.crowd?.current_capacity_utilization >= 75 && d.crowd?.current_capacity_utilization < 85);
      if (mapFilter === 'MODERATE') return d.crowd?.current_crowd_level === 'MODERATE';
      if (mapFilter === 'LOW') return d.crowd?.current_crowd_level === 'LOW';
      return true;
    });

    filtered.forEach(dest => {
      const lat = dest.latitude || 26.9124;
      const lng = dest.longitude || 75.7873;
      const isSelected = dest.site_id === selectedSiteId;
      const cap = dest.crowd?.current_capacity_utilization || 50;
      const level = dest.crowd?.current_crowd_level || 'MODERATE';

      // Colors
      let pinColor = '#10B981'; // Green
      let glowColor = 'rgba(16, 185, 129, 0.4)';
      if (level === 'CRITICAL' || cap >= 88) {
        pinColor = '#EF4444'; // Red
        glowColor = 'rgba(239, 68, 68, 0.6)';
      } else if (level === 'HIGH' || cap >= 75) {
        pinColor = '#F97316'; // Orange
        glowColor = 'rgba(249, 115, 22, 0.5)';
      } else if (level === 'MODERATE' || cap >= 55) {
        pinColor = '#F59E0B'; // Amber
        glowColor = 'rgba(245, 158, 11, 0.4)';
      }

      // Custom Leaflet HTML Icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -50%);
            cursor: pointer;
            text-align: center;
          ">
            <div style="
              width: ${isSelected ? '28px' : '20px'};
              height: ${isSelected ? '28px' : '20px'};
              background-color: ${pinColor};
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 ${isSelected ? '14px' : '8px'} ${glowColor};
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto;
              transition: all 0.3s ease;
            ">
              <span style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></span>
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.88);
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 6px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              white-space: nowrap;
              margin-top: 2px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${dest.site_name} <span style="color: ${pinColor}">${cap}%</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectSite(dest.site_id);
        map.flyTo([lat, lng], 12, { duration: 1.2 });
      });

      markersRef.current.push(marker);
    });
  }, [destinations, selectedSiteId, mapFilter]);

  // Fly to selected site if changed externally
  useEffect(() => {
    if (!mapInstanceRef.current || !destinations || !selectedSiteId) return;
    const site = destinations.find(d => d.site_id === selectedSiteId);
    if (site && site.latitude && site.longitude) {
      mapInstanceRef.current.flyTo([site.latitude, site.longitude], 12, { duration: 1.2 });
    }
  }, [selectedSiteId]);

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px] z-0" />

      {/* Layer Switcher Controls (Satellite / Topo / Street) */}
      <div className="absolute top-3 left-3 z-10 flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setMapLayer('satellite')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            mapLayer === 'satellite'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🛰️ Real Satellite
        </button>
        <button
          onClick={() => setMapLayer('topo')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            mapLayer === 'topo'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏔️ Topo Terrain
        </button>
        <button
          onClick={() => setMapLayer('osm')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            mapLayer === 'osm'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🗺️ Clean Vector
        </button>
      </div>

      {/* Mini Watermark / Status Badge */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-700 shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Satellite GIS: <strong>113 Destinations Active</strong></span>
      </div>
    </div>
  );
}
