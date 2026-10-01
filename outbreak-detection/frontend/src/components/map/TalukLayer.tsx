import { CircleMarker, Tooltip } from 'react-leaflet';
import type { MapData } from '../../types/dashboard';

interface TalukLayerProps {
  mapData: MapData | null;
  selectedTalukId?: string | null;
  onSelect?: (id: string) => void;
}

export default function TalukLayer({
  mapData,
  selectedTalukId,
  onSelect
}: TalukLayerProps) {
  if (!mapData || !mapData.taluks) return null;

  return (
    <>
      {mapData.taluks.map((taluk) => {
        if (taluk.latitude == null || taluk.longitude == null) return null;

        const isSelected = taluk.id === selectedTalukId;

        return (
          <CircleMarker
            key={taluk.id}
            center={[taluk.latitude, taluk.longitude]}
            radius={
              isSelected
                ? Math.max(
                    8,
                    Math.min(24, taluk.cases * 2 + 3)
                  )
                : taluk.cases > 0
                  ? Math.max(5, Math.min(20, taluk.cases * 2))
                  : 3
            }
            pathOptions={{
              color: isSelected
                ? '#ffffff'
                : taluk.riskLevel === 'High'
                  ? 'red'
                  : taluk.riskLevel === 'Moderate'
                    ? 'orange'
                    : 'green',
              weight: isSelected ? 3 : 1,
              fillOpacity: isSelected ? 0.9 : 0.6,
              fillColor:
                taluk.riskLevel === 'High'
                  ? 'red'
                  : taluk.riskLevel === 'Moderate'
                    ? 'orange'
                    : 'green'
            }}
            eventHandlers={{
              click: () => onSelect && onSelect(taluk.id)
            }}
          >
            <Tooltip>
              <strong>{taluk.name}</strong>
              <br />
              Cases: {taluk.cases}
              <br />
              Previous Cases: {taluk.previousCases}
              <br />
              Risk: {taluk.riskLevel}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}