import { useEffect, useState } from "react";
import { getDashboardMap } from "../api/dashboard";
import { getKeralaGeometry } from "../api/geography";
import { getClusters, getClusterById } from "../api/clusters";
import KeralaMap from "../components/map/KeralaMap";
import type { MapData } from "../types/dashboard";
import type { GeoJSONFeatureCollection } from "../types/geography";
import type { Cluster } from "../types/clusters";

export default function OutbreakMap() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [geometry, setGeometry] = useState<GeoJSONFeatureCollection | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  useEffect(() => {
    Promise.all([getDashboardMap(), getKeralaGeometry(), getClusters()])
      .then(([mapRes, geoRes, clustersRes]) => {
        setMapData(mapRes);
        setGeometry(geoRes);
        setClusters(clustersRes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedClusterId) {
      getClusterById(selectedClusterId).then(setSelectedCluster).catch(console.error);
    } else {
      setSelectedCluster(null);
    }
  }, [selectedClusterId]);

  if (loading) return <div>Loading map...</div>;
  if (error) return <div>Error loading map: {error}</div>;

  return (
    <div>
      <h1>Outbreak Map</h1>
      
      <KeralaMap 
        mapData={mapData}
        keralaGeometry={geometry}
        clusters={clusters}
        onDistrictSelect={(id) => console.log('District selected:', id)}
        onTalukSelect={(id) => console.log('Taluk selected:', id)}
        onClusterSelect={(id) => setSelectedClusterId(id)}
      />

      {selectedCluster && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', background: '#f9f9f9' }}>
          <h3>Selected Cluster Details: {selectedCluster.id}</h3>
          <pre>{JSON.stringify(selectedCluster, null, 2)}</pre>
          <button onClick={() => setSelectedClusterId(null)}>Clear Selection</button>
        </div>
      )}
    </div>
  );
}
