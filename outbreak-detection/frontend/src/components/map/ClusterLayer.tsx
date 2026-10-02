import { Circle, Tooltip } from 'react-leaflet';
import type { Cluster } from '../../types/clusters';

interface ClusterLayerProps {
  clusters: Cluster[];
  selectedClusterId?: string | null;
  onSelect?: (id: string) => void;
}

export default function ClusterLayer({
  clusters,
  selectedClusterId,
  onSelect
}: ClusterLayerProps) {
  return (
    <>
      {clusters.map((cluster) => {
        if (
          !cluster.epicentre ||
          cluster.epicentre.latitude == null ||
          cluster.epicentre.longitude == null
        ) {
          return null;
        }

        const isSelected = cluster.id === selectedClusterId;

        return (
          <Circle
            key={`cluster-${cluster.id}`}
            center={[
              cluster.epicentre.latitude,
              cluster.epicentre.longitude
            ]}
            radius={isSelected ? 7000 : 5000}
            pathOptions={{
              color: isSelected ? '#ffffff' : '#d32f2f',
              fillColor: isSelected ? '#ff5252' : '#f44336',
              fillOpacity: isSelected ? 0.4 : 0.2,
              weight: isSelected ? 4 : 2,
            }}
            eventHandlers={{
              click: () => onSelect && onSelect(cluster.id)
            }}
          >
            <Tooltip>
              <strong>Cluster {cluster.id}</strong><br />
              Disease: {cluster.disease}<br />
              Hotspot: {cluster.hotspot}<br />
              Total Cases: {cluster.totalCases}<br />
              Temporal Signal: {cluster.temporalSignal}
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}