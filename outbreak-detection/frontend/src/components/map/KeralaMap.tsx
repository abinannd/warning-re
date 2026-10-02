import { useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
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
  selectedClusterId?: string | null;

  onDistrictSelect?: (id: string) => void;
  onTalukSelect?: (id: string) => void;
  onClusterSelect?: (id: string) => void;
}

const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [8.0, 74.8],
  [12.8, 77.4]
];

interface MapViewControllerProps {
  mapData: MapData | null;
  selectedDistrictId?: string | null;
  selectedTalukId?: string | null;
}

function MapViewController({
  mapData,
  selectedDistrictId,
  selectedTalukId
}: MapViewControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!mapData) return;

    // No district/taluk selected → return to Kerala-wide view
    if (!selectedDistrictId && !selectedTalukId) {
      map.flyToBounds(DEFAULT_BOUNDS, {
        padding: [20, 20],
        duration: 1
      });

      return;
    }

    // Taluk selected → zoom directly to the taluk
    if (selectedTalukId) {
      const selectedTaluk = mapData.taluks.find(
        (taluk) => taluk.id === selectedTalukId
      );

      if (
        selectedTaluk &&
        selectedTaluk.latitude != null &&
        selectedTaluk.longitude != null
      ) {
        map.flyTo(
          [selectedTaluk.latitude, selectedTaluk.longitude],
          11,
          {
            duration: 1
          }
        );
      }

      return;
    }

    // District selected → calculate bounds from its taluks
    if (selectedDistrictId) {
      const districtTaluks = mapData.taluks.filter(
        (taluk) => taluk.districtId === selectedDistrictId
      );

      const validTaluks = districtTaluks.filter(
        (taluk) =>
          taluk.latitude != null &&
          taluk.longitude != null
      );

      if (validTaluks.length === 1) {
        map.flyTo(
          [
            validTaluks[0].latitude,
            validTaluks[0].longitude
          ],
          10,
          {
            duration: 1
          }
        );

        return;
      }

      if (validTaluks.length > 1) {
        const bounds = validTaluks.map((taluk) => [
          taluk.latitude,
          taluk.longitude
        ] as [number, number]);

        map.flyToBounds(bounds, {
          padding: [40, 40],
          maxZoom: 10,
          duration: 1
        });
      }
    }
  }, [
    map,
    mapData,
    selectedDistrictId,
    selectedTalukId
  ]);

  return null;
}

export default function KeralaMap({
  mapData,
  keralaGeometry,
  clusters,
  selectedDistrictId,
  selectedTalukId,
  selectedClusterId,
  onDistrictSelect,
  onTalukSelect,
  onClusterSelect
}: KeralaMapProps) {
  const bounds =
    mapData?.bounds && mapData.bounds.length === 2
      ? mapData.bounds
      : DEFAULT_BOUNDS;

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
        <MapViewController
          mapData={mapData}
          selectedDistrictId={selectedDistrictId}
          selectedTalukId={selectedTalukId}
        />

        <MapLayers
          mapData={mapData}
          keralaGeometry={keralaGeometry}
          clusters={clusters}
          selectedDistrictId={selectedDistrictId}
          selectedTalukId={selectedTalukId}
          selectedClusterId={selectedClusterId}
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