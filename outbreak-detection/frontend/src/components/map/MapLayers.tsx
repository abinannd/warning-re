import { TileLayer } from 'react-leaflet';
import DistrictLayer from './DistrictLayer';
import TalukLayer from './TalukLayer';
import SignalLayer from './SignalLayer';
import ClusterLayer from './ClusterLayer';
import type { MapData } from '../../types/dashboard';
import type { GeoJSONFeatureCollection } from '../../types/geography';
import type { Cluster } from '../../types/clusters';

interface MapLayersProps {
  mapData: MapData | null;
  keralaGeometry: GeoJSONFeatureCollection | null;
  clusters: Cluster[];
  onDistrictSelect?: (id: string) => void;
  onTalukSelect?: (id: string) => void;
  onClusterSelect?: (id: string) => void;
}

export default function MapLayers({ mapData, keralaGeometry, clusters, onDistrictSelect, onTalukSelect, onClusterSelect }: MapLayersProps) {
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* 
        The layers are separated as requested. 
        In real usage, keralaGeometry might contain either state outline, or all districts/taluks. 
        We pass the geometry and data down to specific layers to handle rendering logic.
      */}
      <DistrictLayer geometry={keralaGeometry} onSelect={onDistrictSelect} />
      <TalukLayer mapData={mapData} onSelect={onTalukSelect} />
      <SignalLayer mapData={mapData} />
      <ClusterLayer clusters={clusters} onSelect={onClusterSelect} />
    </>
  );
}
