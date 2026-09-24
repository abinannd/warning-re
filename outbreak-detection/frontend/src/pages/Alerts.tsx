import { useEffect, useState } from "react";
import { getAlerts, getAdvisory } from "../api/alerts";
import type { Alert, Advisory } from "../types/intelligence";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAlerts(), getAdvisory()])
      .then(([alertsRes, advisoryRes]) => {
        setAlerts(alertsRes);
        setAdvisory(advisoryRes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading alerts...</div>;
  if (error) return <div>Error loading alerts: {error}</div>;

  return (
    <div>
      <h1>Alerts</h1>

      <section style={{ marginBottom: "20px" }}>
        <h2>System Alerts</h2>
        {alerts.length > 0 ? (
          <pre>{JSON.stringify(alerts, null, 2)}</pre>
        ) : (
          <div>No active alerts.</div>
        )}
      </section>

      <section>
        <h2>Current Advisory</h2>
        {advisory ? (
          <pre>{JSON.stringify(advisory, null, 2)}</pre>
        ) : (
          <div>No advisory data available.</div>
        )}
      </section>
    </div>
  );
}
