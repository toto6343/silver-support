import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface RequestLocation {
  id: number;
  summary: string;
  latitude: number;
  longitude: number;
  urgency: string;
}

interface InfrastructureLocation {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface SupporterLocation {
  id: number;
  name: string;
  specialty: string;
  status: string;
  latitude: number;
  longitude: number;
}

export default function MapView() {
  const [requests, setRequests] = useState<RequestLocation[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureLocation[]>([]);
  const [supporters, setSupporters] = useState<SupporterLocation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, infraRes, suppRes] = await Promise.all([
          axios.get('http://localhost:3001/api/requests'),
          axios.get('http://localhost:3001/api/infrastructure'),
          axios.get('http://localhost:3001/api/supporters')
        ]);
        
        setRequests(reqRes.data.filter((r: any) => r.latitude && r.longitude));
        setInfrastructure(infraRes.data.filter((i: any) => i.latitude && i.longitude));
        setSupporters(suppRes.data.filter((s: any) => s.latitude && s.longitude));
      } catch (err) {
        console.error('Failed to fetch map data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={[36.5, 127.5]} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Emergency Requests - Red Markers */}
        {requests.map((req) => (
          <CircleMarker
            key={`req-${req.id}`}
            center={[req.latitude, req.longitude]}
            radius={8}
            pathOptions={{ 
              fillColor: req.urgency === '긴급' ? '#ef4444' : '#f97316', 
              color: '#fff', 
              weight: 2, 
              fillOpacity: 0.8 
            }}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-red-600">응급 호출</h4>
                <p className="text-sm">{req.summary}</p>
                <p className="text-xs text-slate-500 mt-1">긴급도: {req.urgency}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Supporters - Green Markers */}
        {supporters.map((supp) => (
          <CircleMarker
            key={`supp-${supp.id}`}
            center={[supp.latitude, supp.longitude]}
            radius={6}
            pathOptions={{ 
              fillColor: '#10b981', 
              color: '#fff', 
              weight: 2, 
              fillOpacity: 0.8 
            }}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-emerald-600">{supp.name} 서포터</h4>
                <p className="text-sm">{supp.specialty}</p>
                <p className="text-xs text-slate-500 mt-1">상태: {supp.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Infrastructure - Blue Markers */}
        {infrastructure.map((infra) => (
          <CircleMarker 
            key={`infra-${infra.id}`} 
            center={[infra.latitude, infra.longitude]}
            radius={4}
            pathOptions={{ 
              fillColor: '#3b82f6', 
              color: '#fff', 
              weight: 1, 
              fillOpacity: 0.6 
            }}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-slate-800">{infra.name}</h4>
                <p className="text-sm text-slate-600">{infra.type}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="font-medium">응급 호출 (119)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="font-medium">활동 서포터</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 opacity-60"></div>
          <span className="font-medium">치매센터/경로당</span>
        </div>
      </div>
    </div>
  );
}
