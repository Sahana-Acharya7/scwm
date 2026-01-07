'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// CSS: Hides routing text box, styles markers, and blue user dot
const mapStyles = `
  .leaflet-div-icon { background: transparent; border: none; }
  .user-dot-container { position: relative; display: flex; justify-content: center; align-items: center; }
  .user-dot { width: 14px; height: 14px; background: #3b82f6; border: 2px solid white; border-radius: 50%; z-index: 10; }
  .user-pulse { position: absolute; width: 30px; height: 30px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
  .glow-pin { filter: drop-shadow(0 0 10px #10b981) scale(1.3); font-size: 24px; }
  .emoji-pin { font-size: 20px; transition: all 0.3s; }
  
  /* CRITICAL: HIDES THE WHITE INSTRUCTION BOX ON THE MAP */
  .leaflet-routing-container { display: none !important; visibility: hidden !important; }
`;

// --- HELPER: Distance Calc ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// --- COMPONENT: Map Controller ---
function MapManager({ userPos, selectedCenter, routingTarget }: any) {
  const map = useMap();

  useEffect(() => {
    if (selectedCenter) {
      map.flyTo([selectedCenter.latitude, selectedCenter.longitude], 15);
    }
  }, [selectedCenter, map]);

  useEffect(() => {
    if (typeof window !== "undefined" && routingTarget && userPos) {
      import('leaflet-routing-machine').then(() => {
        const routingControl = (L as any).Routing.control({
          waypoints: [
            L.latLng(userPos[0], userPos[1]), 
            L.latLng(routingTarget[0], routingTarget[1])
          ],
          lineOptions: {
            styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }] // Blue Route
          },
          routeWhileDragging: false,
          addWaypoints: false,
          show: false, 
          createMarker: () => null 
        }).addTo(map);

        return () => map.removeControl(routingControl);
      }).catch(err => console.error("Routing error:", err));
    }
  }, [routingTarget, userPos, map]);

  return null;
}

export default function MapComponent({ centers }: { centers: any[] }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [routingTarget, setRoutingTarget] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Location access denied", err)
      );
    }
  }, []);

  const sortedData = useMemo(() => {
    if (!centers) return [];
    return [...centers].map(c => ({
      ...c,
      dist: userPos ? calculateDistance(userPos[0], userPos[1], c.latitude, c.longitude) : null
    })).sort((a, b) => (a.dist ?? 9999) - (b.dist ?? 9999));
  }, [centers, userPos]);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[600px] w-full text-white bg-slate-950 p-2 rounded-xl">
      <style dangerouslySetInnerHTML={{ __html: mapStyles }} />

      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-slate-900 rounded-xl p-4 overflow-y-auto border border-slate-800">
        <h3 className="text-emerald-400 font-bold mb-4 flex justify-between items-center text-sm">
          Nearby Facilities
          {userPos && <span className="text-[10px] text-slate-500 font-normal italic">Sorted by KM</span>}
        </h3>
        <div className="space-y-2">
          {sortedData.length > 0 ? (
            sortedData.map((c, i) => (
              <div 
                key={i} 
                onClick={() => { 
                  setSelectedCenter(c); 
                  setRoutingTarget([c.latitude, c.longitude]); 
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCenter?.name === c.name 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-slate-800 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <p className="font-bold text-xs truncate">{c.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {c.dist ? `🚗 ${c.dist.toFixed(1)} km away` : 'Calculating distance...'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-10">No centers found for this debris type.</p>
          )}
        </div>
      </div>

      {/* MAP VIEW */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800 z-0">
        <MapContainer 
          center={[12.9716, 77.5946]} 
          zoom={12} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapManager userPos={userPos} selectedCenter={selectedCenter} routingTarget={routingTarget} />

          {userPos && (
            <Marker position={userPos} icon={L.divIcon({
              className: 'leaflet-div-icon',
              html: `<div class="user-dot-container"><div class="user-pulse"></div><div class="user-dot"></div></div>`
            })}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {centers.map((c, i) => (
            <Marker 
              key={i} 
              position={[c.latitude, c.longitude]} 
              icon={L.divIcon({
                className: 'leaflet-div-icon',
                html: `<div class="emoji-pin ${selectedCenter?.name === c.name ? 'glow-pin' : ''}">📍</div>`
              })}
              eventHandlers={{ click: () => { 
                setSelectedCenter(c); 
                setRoutingTarget([c.latitude, c.longitude]); 
              }}}
            >
              <Popup>
                <div className="text-slate-900 min-w-[150px]">
                  <b className="text-sm">{c.name}</b><br/>
                  <p className="text-[10px] leading-tight my-1 text-slate-600">{c.address}</p>
                  <a href={`http://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" className="text-blue-600 text-[10px] font-bold block mt-2">Open in Google Maps ➔</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {userPos && (
          <button 
            onClick={() => { setSelectedCenter({ latitude: userPos[0], longitude: userPos[1] }); }}
            className="absolute bottom-6 right-6 z-[1000] bg-emerald-500 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-400 transition-all"
            title="My Location"
          >
            🎯
          </button>
        )}
      </div>
    </div>
  );
}