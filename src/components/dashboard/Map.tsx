import React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2, MapPin } from 'lucide-react';

export default function MapComponent() {
  const suppliers = useQuery(api.suppliers.getAll);

  // Check if Mapbox token is available
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

  if (!suppliers) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No suppliers found.</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: 77.5946, // Bangalore coordinates
            latitude: 12.9716,
            zoom: 10,
          }}
          style={{ width: '100%', height: '400px' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onError={(error) => {
            console.error('Mapbox error:', error);
          }}
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
      </div>
    );
  } catch (error) {
    console.error('Map rendering error:', error);
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Unable to load map. Please check your Mapbox configuration.
          </p>
        </div>
      </div>
    );
  }
}