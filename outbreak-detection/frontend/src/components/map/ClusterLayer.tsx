import { Circle, Tooltip } from 'react-leaflet';
import type { Cluster } from '../../types/clusters';

interface ClusterLayerProps {
  clusters: Cluster[];
  onSelect?: (id: string) => void;
}

export default function ClusterLayer({ clusters, onSelect }: ClusterLayerProps) {
  return (
    <>
      {clusters.map((cluster) => {
        if (!cluster.epicentre || cluster.epicentre.latitude == null || cluster.epicentre.longitude == null) return null;
        
        return (
          <Circle
            key={`cluster-${cluster.id}`}
            center={[cluster.epicentre.latitude, cluster.epicentre.longitude]}
            radius={5000} // ~5km radius representation for now
            pathOptions={{
              color: '#d32f2f', // Red cluster outline
              fillColor: '#f44336',
              fillOpacity: 0.2,
              weight: 2,
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
