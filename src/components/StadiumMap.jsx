import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import './StadiumMap.css';

const WEMBLEY_CENTER = { lat: 51.5560, lng: -0.2796 };

const STANDS = [
  { id: 'north', name: 'North Stand', lat: 51.5567, lng: -0.2796 },
  { id: 'south', name: 'South Stand', lat: 51.5553, lng: -0.2796 },
  { id: 'east', name: 'East Stand', lat: 51.5560, lng: -0.2783 },
  { id: 'west', name: 'West Stand', lat: 51.5560, lng: -0.2809 },
];

const StadiumMap = React.memo(({ densities, onZoneClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const listenersRef = useRef({});

  // Initialize Map
  useEffect(() => {
    if (!window.google || !mapRef.current) {
      console.warn("Google Maps API not loaded. Ensure your API key is in .env");
      return;
    }

    if (!mapInstanceRef.current) {
      // Dark mode map style
      const darkMapStyle = [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
        { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
        { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
      ];

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: WEMBLEY_CENTER,
        zoom: 17,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Create initial markers
      STANDS.forEach((stand) => {
        const marker = new window.google.maps.Marker({
          position: { lat: stand.lat, lng: stand.lng },
          map: mapInstanceRef.current,
          title: stand.name,
          label: {
            text: stand.name.split(' ')[0],
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
          },
          cursor: 'pointer',
        });

        markersRef.current[stand.id] = marker;

        // Click listener → GA event via onZoneClick callback
        listenersRef.current[stand.id] = marker.addListener('click', () => {
          if (typeof onZoneClick === 'function') {
            onZoneClick(stand.id);
          }
        });
      });
    }

    // Cleanup listeners on unmount
    return () => {
      Object.values(listenersRef.current).forEach((listener) => {
        if (listener && window.google) {
          window.google.maps.event.removeListener(listener);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Markers when densities change
  const getMarkerIcon = useCallback((density) => {
    let fillColor = '#10b981'; // Green: Low (<40%)
    if (density >= 70) fillColor = '#ef4444'; // Red: High (>70%)
    else if (density >= 40) fillColor = '#f59e0b'; // Yellow: Medium (40-70%)

    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: fillColor,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 24,
    };
  }, []);

  useEffect(() => {
    if (!window.google || !densities) return;

    STANDS.forEach((stand) => {
      const marker = markersRef.current[stand.id];
      if (marker && densities[stand.id] !== undefined) {
        marker.setIcon(getMarkerIcon(densities[stand.id]));
      }
    });
  }, [densities]);

  return (
    <div className="map-wrapper" aria-label="Live Crowd Heatmap">
      <div className="map-legend" role="complementary" aria-label="Map Legend">
        <div className="legend-item"><span className="dot green" aria-hidden="true"></span> &lt; 40% (Low)</div>
        <div className="legend-item"><span className="dot yellow" aria-hidden="true"></span> 40-70% (Med)</div>
        <div className="legend-item"><span className="dot red" aria-hidden="true"></span> &gt; 70% (High)</div>
      </div>
      <div ref={mapRef} className="google-map-container" aria-hidden="true" />
      {/* Fallback error message if map doesn't load */}
      {!window.google && (
        <div className="map-error" role="alert">
          <p>Google Maps API failed to load.</p>
          <p>Please check your .env API key configuration.</p>
        </div>
      )}
    </div>
  );
});

StadiumMap.propTypes = {
  densities: PropTypes.objectOf(PropTypes.number).isRequired,
  onZoneClick: PropTypes.func,
};

StadiumMap.defaultProps = {
  onZoneClick: null,
};

StadiumMap.displayName = 'StadiumMap';

export default StadiumMap;
