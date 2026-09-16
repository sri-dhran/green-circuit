import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

// Fix default Leaflet icon paths in Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom HTML Pin Icons
const createPulseUserIcon = () => {
  return L.divIcon({
    className: 'gc-map-user-pin-wrapper',
    html: `<div class="gc-map-user-pin"><div class="gc-map-pulse-ring"></div><span class="gc-map-pin-emoji">📍</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -32],
  });
};

const createOfficeIcon = (isSelected = false) => {
  return L.divIcon({
    className: `gc-map-office-pin-wrapper ${isSelected ? 'selected' : ''}`,
    html: `<div class="gc-map-office-pin ${isSelected ? 'is-selected' : ''}"><span class="gc-map-office-emoji">♻️</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -32],
  });
};

const InteractiveMap = ({
  center = { lat: 10.9018, lng: 76.9962 },
  zoom = 12,
  userLocation = null,
  offices = [],
  selectedOffice = null,
  onSelectOffice = null,
  onLocationChange = null,
  allowLocationPick = false,
  height = '380px',
  showRoute = true,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeLineRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.lat || center?.lat || 10.9018;
      const initialLng = userLocation?.lng || center?.lng || 76.9962;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Dark Matter / Voyager Hybrid Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);

      if (allowLocationPick && onLocationChange) {
        map.on('click', (e) => {
          onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and route lines dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const bounds = L.latLngBounds([]);

    // 1. User Marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const userLatLng = [userLocation.lat, userLocation.lng];
      const userMarker = L.marker(userLatLng, {
        icon: createPulseUserIcon(),
        title: 'Your Pickup Location',
        draggable: allowLocationPick,
      });

      if (allowLocationPick && onLocationChange) {
        userMarker.on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          onLocationChange({ lat: newPos.lat, lng: newPos.lng });
        });
      }

      userMarker.bindPopup(`
        <div class="gc-map-popup">
          <h4 style="margin: 0 0 4px; color: #00e676;">📍 Your Pickup Location</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}
          </p>
        </div>
      `);

      group.addLayer(userMarker);
      bounds.extend(userLatLng);
    }

    // 2. Office Markers
    if (Array.isArray(offices)) {
      offices.forEach((office) => {
        if (!office.latitude || !office.longitude) return;

        const isSelected = selectedOffice && (selectedOffice.id === office.id || selectedOffice.officeId === office.id);
        const officeLatLng = [office.latitude, office.longitude];

        const officeMarker = L.marker(officeLatLng, {
          icon: createOfficeIcon(isSelected),
          title: office.officeName || office.name,
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'gc-map-popup';
        popupContent.innerHTML = `
          <div style="margin-bottom: 6px;">
            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(0,230,118,0.15); color: #00c853; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
              ${office.type || 'E-Waste Center'}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #111;">
            ${office.officeName || office.name}
          </h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #444; line-height: 1.3;">
            ${office.address}
          </p>
          ${office.distanceKm != null ? `<div style="font-size: 11px; font-weight: 600; color: #009688; margin-bottom: 6px;">📍 ~${office.distanceKm} km away</div>` : ''}
          ${office.phoneNumber ? `<div style="font-size: 11px; color: #555; margin-bottom: 8px;">📞 ${office.phoneNumber}</div>` : ''}
        `;

        if (onSelectOffice) {
          const selectBtn = document.createElement('button');
          selectBtn.type = 'button';
          selectBtn.className = 'gc-map-popup-btn';
          selectBtn.innerText = isSelected ? '✓ Selected Center' : 'Select This Center';
          selectBtn.onclick = () => {
            onSelectOffice(office);
            officeMarker.closePopup();
          };
          popupContent.appendChild(selectBtn);
        }

        officeMarker.bindPopup(popupContent);
        group.addLayer(officeMarker);
        bounds.extend(officeLatLng);
      });
    }

    // 3. Draw route line if user and selected office exist
    if (showRoute && userLocation && selectedOffice && selectedOffice.latitude && selectedOffice.longitude) {
      const lineCoordinates = [
        [userLocation.lat, userLocation.lng],
        [selectedOffice.latitude, selectedOffice.longitude],
      ];

      routeLineRef.current = L.polyline(lineCoordinates, {
        color: '#00e676',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // Fit view to bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [userLocation, offices, selectedOffice, allowLocationPick, showRoute]);

  return (
    <div className="gc-interactive-map-root" style={{ height }}>
      <div ref={mapContainerRef} className="gc-leaflet-container" style={{ width: '100%', height: '100%' }} />
      {allowLocationPick && (
        <div className="gc-map-floating-hint">
          <span>💡 Click anywhere on map or drag the blue pin to set pickup point</span>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
