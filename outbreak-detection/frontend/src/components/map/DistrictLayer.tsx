import { GeoJSON } from 'react-leaflet';

import type { GeoJSONFeatureCollection } from '../../types/geography';

interface DistrictLayerProps {
  geometry: GeoJSONFeatureCollection | null;
  selectedDistrictId?: string | null;
  onSelect?: (id: string) => void;
}

export default function DistrictLayer({
  geometry,
  selectedDistrictId,
  onSelect
}: DistrictLayerProps) {
  if (!geometry || !geometry.features) return null;

  return (
    <GeoJSON
      data={geometry}
      style={(feature) => {
        const districtId = feature?.properties?.id;
        const isSelected = districtId === selectedDistrictId;

        return {
          color: isSelected ? '#ffffff' : '#3388ff',
          weight: isSelected ? 3 : 1,
          fillOpacity: isSelected ? 0.3 : 0.1,
          fillColor: isSelected ? '#3388ff' : undefined,
        };
      }}
      onEachFeature={(feature, layer) => {
        layer.on({
          click: () => {
            const id = feature.properties?.id;

            if (id && onSelect) {
              onSelect(id);
            }
          }
        });
      }}
    />
  );
}