import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2, MapPin } from 'lucide-react';

export default function MapComponent() {
  const mapData = useQuery(api.map.getMapData);
  const [selected, setSelected] = useState<any>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  
  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Mapbox access token not configured.
          </p>
          <p className="text-sm text-muted-foreground">
            Please set VITE_MAPBOX_ACCESS_TOKEN in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const { wholesalers, vendors } = mapData;

  if (wholesalers.length === 0 && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No suppliers or vendors found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: 77.5946, // Bangalore coordinates
          latitude: 12.9716,
          zoom: 6,
        }}
        style={{ width: '100%', height: '500px' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={() => setSelected(null)}
      >
        {wholesalers.map((wholesaler) => (
          <Marker
            key={wholesaler._id}
            longitude={wholesaler.location.lng}
            latitude={wholesaler.location.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected({ type: 'wholesaler', ...wholesaler });
            }}
          >
            <MapPin className="h-6 w-6 text-blue-500 fill-current" />
          </Marker>
        ))}
        {vendors.map((vendor) =>
          vendor.location ? (
            <Marker
              key={vendor._id}
              longitude={vendor.location.lng}
              latitude={vendor.location.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelected({ type: 'vendor', ...vendor });
              }}
            >
              <MapPin className="h-6 w-6 text-red-500 fill-current" />
            </Marker>
          ) : null
        )}

        {selected && (
          <Popup
            longitude={selected.location.lng}
            latitude={selected.location.lat}
            onClose={() => setSelected(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div>
              <h3 className="font-bold">{selected.name}</h3>
              <p className="capitalize text-sm text-muted-foreground">{selected.type}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}