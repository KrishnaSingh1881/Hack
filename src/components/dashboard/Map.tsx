import React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2 } from 'lucide-react';

export default function MapComponent() {
  const suppliers = useQuery(api.suppliers.getAll);

  if (!suppliers) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: 77.5946, // Bangalore coordinates
        latitude: 12.9716,
        zoom: 10,
      }}
      style={{ width: '100%', height: '400px' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {suppliers.map((supplier) => (
        <Marker
          key={supplier._id}
          longitude={supplier.location.lng}
          latitude={supplier.location.lat}
          color="red"
        />
      ))}
    </Map>
  );
}
