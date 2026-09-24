import { useEffect, useState } from "react";
import { getTrends, getSignals } from "../api/intelligence";
import type { DiseaseTrends, TemporalSignal } from "../types/intelligence";

export default function Intelligence() {
  const [trends, setTrends] = useState<DiseaseTrends | null>(null);
  const [signals, setSignals] = useState<TemporalSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getTrends({ disease: "dengue" }), // Default parameter for testing
      getSignals()
    ])
      .then(([trendsRes, signalsRes]) => {
        setTrends(trendsRes);
        setSignals(signalsRes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading intelligence data...</div>;
  if (error) return <div>Error loading intelligence: {error}</div>;

  return (
    <div>
      <h1>Intelligence</h1>

      <section style={{ marginBottom: "20px" }}>
        <h2>Trends</h2>
        {trends && trends.data && trends.data.length > 0 ? (
          <pre>{JSON.stringify(trends, null, 2)}</pre>
        ) : (
          <div>No trend data</div>
        )}
      </section>

      <section>
        <h2>Signals</h2>
        {signals.length > 0 ? (
          <pre>{JSON.stringify(signals.slice(0, 2), null, 2)}</pre>
        ) : (
          <div>No active signals</div>
        )}
      </section>
    </div>
  );
}
