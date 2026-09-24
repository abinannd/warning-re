import { CircleMarker, Tooltip } from 'react-leaflet';
import type { MapData } from '../../types/dashboard';

interface SignalLayerProps {
  mapData: MapData | null;
}

export default function SignalLayer({ mapData }: SignalLayerProps) {
  if (!mapData || !mapData.taluks) return null;

  return (
    <>
      {mapData.taluks.map((taluk) => {
        if (!taluk.temporalSignal && !taluk.spatialSignal) return null;
        if (taluk.latitude == null || taluk.longitude == null) return null;
        
        return (
          <CircleMarker
            key={`signal-${taluk.id}`}
            center={[taluk.latitude, taluk.longitude]}
            radius={8}
            pathOptions={{
              color: '#9c27b0', // Purple for signals
              fillOpacity: 0,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Tooltip>
              <strong>{taluk.name} Signal</strong><br />
              Temporal: {taluk.temporalSignal ? 'Yes' : 'No'}<br />
              Spatial: {taluk.spatialSignal ? 'Yes' : 'No'}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
