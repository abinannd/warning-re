import { useEffect, useState } from "react";
import { getDashboardSummary, getDashboardMap } from "../api/dashboard";
import { getAlerts } from "../api/alerts";
import { getClusters } from "../api/clusters";
import type { DashboardSummary, MapData } from "../types/dashboard";
import type { Alert } from "../types/intelligence";
import type { Cluster } from "../types/clusters";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getDashboardSummary(),
      getDashboardMap(),
      getAlerts(),
      getClusters()
    ])
      .then(([summaryRes, mapRes, alertsRes, clustersRes]) => {
        setSummary(summaryRes);
        setMapData(mapRes);
        setAlerts(alertsRes);
        setClusters(clustersRes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading dashboard: {error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      
      <section style={{ marginBottom: "20px" }}>
        <h2>Summary</h2>
        {summary ? (
          <pre>{JSON.stringify(summary, null, 2)}</pre>
        ) : (
          <div>No summary data</div>
        )}
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Map Data (Preview)</h2>
        {mapData ? (
          <div>Loaded {mapData.taluks.length} taluks, {mapData.districts.length} districts</div>
        ) : (
          <div>No map data</div>
        )}
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Alerts</h2>
        {alerts.length > 0 ? (
          <pre>{JSON.stringify(alerts.slice(0, 2), null, 2)}</pre>
        ) : (
          <div>No active alerts</div>
        )}
      </section>

      <section>
        <h2>Clusters</h2>
        {clusters.length > 0 ? (
          <pre>{JSON.stringify(clusters.slice(0, 2), null, 2)}</pre>
        ) : (
          <div>No active clusters</div>
        )}
      </section>
    </div>
  );
}
