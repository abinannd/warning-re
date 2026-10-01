import { MapContainer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapLayers from './MapLayers';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import type { MapData } from '../../types/dashboard';
import type { GeoJSONFeatureCollection } from '../../types/geography';
import type { Cluster } from '../../types/clusters';

interface KeralaMapProps {
  mapData: MapData | null;
  keralaGeometry: GeoJSONFeatureCollection | null;
  clusters: Cluster[];

  selectedDistrictId?: string | null;
  selectedTalukId?: string | null;

  onDistrictSelect?: (id: string) => void;
  onTalukSelect?: (id: string) => void;
  onClusterSelect?: (id: string) => void;
}

export default function KeralaMap({
  mapData,
  keralaGeometry,
  clusters,
  selectedDistrictId,
  selectedTalukId,
  onDistrictSelect,
  onTalukSelect,
  onClusterSelect
}: KeralaMapProps) {
  const defaultBounds: [[number, number], [number, number]] = [
    [8.0, 74.8],
    [12.8, 77.4]
  ];

  const bounds =
    mapData?.bounds && mapData.bounds.length === 2
      ? mapData.bounds
      : defaultBounds;

  return (
    <div
      style={{
        position: 'relative',
        height: '600px',
        width: '100%',
        border: '1px solid #ccc'
      }}
    >
      <MapContainer
        bounds={bounds}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapLayers
          mapData={mapData}
          keralaGeometry={keralaGeometry}
          clusters={clusters}
          selectedDistrictId={selectedDistrictId}
          selectedTalukId={selectedTalukId}
          onDistrictSelect={onDistrictSelect}
          onTalukSelect={onTalukSelect}
          onClusterSelect={onClusterSelect}
        />

        <MapControls />
      </MapContainer>

      <MapLegend />
    </div>
  );
}