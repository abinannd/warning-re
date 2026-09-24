import { CircleMarker, Tooltip } from 'react-leaflet';
import type { MapData } from '../../types/dashboard';

interface TalukLayerProps {
  mapData: MapData | null;
  onSelect?: (id: string) => void;
}

export default function TalukLayer({ mapData, onSelect }: TalukLayerProps) {
  if (!mapData || !mapData.taluks) return null;

  return (
    <>
      {mapData.taluks.map((taluk) => {
        if (taluk.latitude == null || taluk.longitude == null) return null;
        
        return (
          <CircleMarker
            key={taluk.id}
            center={[taluk.latitude, taluk.longitude]}
            radius={taluk.cases > 0 ? Math.max(5, Math.min(20, taluk.cases * 2)) : 3}
            pathOptions={{
              color: taluk.riskLevel === 'High' ? 'red' : taluk.riskLevel === 'Moderate' ? 'orange' : 'green',
              fillOpacity: 0.6
            }}
            eventHandlers={{
              click: () => onSelect && onSelect(taluk.id)
            }}
          >
            <Tooltip>
              <strong>{taluk.name}</strong><br />
              Cases: {taluk.cases}<br />
              Previous Cases: {taluk.previousCases}<br />
              Risk: {taluk.riskLevel}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
