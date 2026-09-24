import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClusters, getClusterById } from "../api/clusters";
import type { Cluster } from "../types/clusters";

export default function Clusters() {
  const { id } = useParams();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [activeCluster, setActiveCluster] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    if (id) {
      getClusterById(id)
        .then((res) => {
          setActiveCluster(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      getClusters()
        .then((res) => {
          setClusters(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div>Loading clusters...</div>;
  if (error) return <div>Error loading clusters: {error}</div>;

  return (
    <div>
      <h1>Clusters {id && `- Detail ${id}`}</h1>

      {id ? (
        <section>
          <h2>Cluster {id} Details</h2>
          {activeCluster ? (
            <pre>{JSON.stringify(activeCluster, null, 2)}</pre>
          ) : (
            <div>Cluster not found</div>
          )}
        </section>
      ) : (
        <section>
          <h2>All Clusters</h2>
          {clusters.length > 0 ? (
            <pre>{JSON.stringify(clusters, null, 2)}</pre>
          ) : (
            <div>No clusters currently identified.</div>
          )}
        </section>
      )}
    </div>
  );
}
