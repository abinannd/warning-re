import { GeoJSON } from 'react-leaflet';
import type { GeoJSONFeatureCollection } from '../../types/geography';

interface DistrictLayerProps {
  geometry: GeoJSONFeatureCollection | null;
  onSelect?: (id: string) => void;
}

export default function DistrictLayer({ geometry, onSelect }: DistrictLayerProps) {
  if (!geometry || !geometry.features) return null;

  return (
    <GeoJSON
      data={geometry}
      style={{
        color: '#3388ff',
        weight: 1,
        fillOpacity: 0.1,
      }}
      onEachFeature={(feature, layer) => {
        layer.on({
          click: () => {
            const id = feature.properties?.id;
            if (id && onSelect) onSelect(id);
          }
        });
      }}
    />
  );
}
