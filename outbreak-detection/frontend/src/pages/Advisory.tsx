import { useEffect, useState } from "react";
import { getAdvisory } from "../api/alerts";
import type { Advisory as AdvisoryType } from "../types/intelligence";

export default function Advisory() {
  const [advisory, setAdvisory] = useState<AdvisoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdvisory()
      .then((res) => {
        setAdvisory(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading advisory...</div>;
  if (error) return <div>Error loading advisory: {error}</div>;

  return (
    <div>
      <h1>Advisory</h1>

      <section>
        <h2>Current Public Health Advisory</h2>
        {advisory ? (
          <pre>{JSON.stringify(advisory, null, 2)}</pre>
        ) : (
          <div>No advisory data available.</div>
        )}
      </section>
    </div>
  );
}
