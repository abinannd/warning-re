import { useEffect, useMemo, useState } from "react";
import "./OutbreakMap.css";
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
        setError(err instanceof Error ? err.message : "Unable to load outbreak map.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedClusterId) {
      setSelectedCluster(null);
      return;
    }

    getClusterById(selectedClusterId)
      .then(setSelectedCluster)
      .catch(() => setSelectedCluster(null));
  }, [selectedClusterId]);

  const activeSignals = useMemo(
    () =>
      mapData?.taluks.filter(
        (taluk) => taluk.temporalSignal || taluk.spatialSignal
      ).length ?? 0,
    [mapData]
  );

  const highRiskLocations = useMemo(
    () =>
      mapData?.taluks.filter(
        (taluk) => taluk.riskLevel.toLowerCase() === "high"
      ).length ?? 0,
    [mapData]
  );

  if (loading) {
    return (
      <div className="outbreak-map-page map-state">
        <div className="map-loading-card">
          <span className="map-loading-dot" />
          <span>Loading outbreak intelligence…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="outbreak-map-page map-state">
        <div className="map-error-card">
          <span>MAP DATA UNAVAILABLE</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="outbreak-map-page">
      <div className="map-page-header">
        <div>
          <div className="map-eyebrow">SPATIOTEMPORAL SURVEILLANCE</div>
          <h1>Outbreak Map</h1>
          <p>
            Live disease signals, high-risk locations and detected clusters
            across Kerala.
          </p>
        </div>

        <div className="map-page-stats">
          <div className="map-stat">
            <span>Taluks</span>
            <strong>{mapData?.taluks.length ?? 0}</strong>
          </div>
          <div className="map-stat">
            <span>Signals</span>
            <strong>{activeSignals}</strong>
          </div>
          <div className="map-stat">
            <span>High risk</span>
            <strong>{highRiskLocations}</strong>
          </div>
          <div className="map-stat">
            <span>Clusters</span>
            <strong>{clusters.length}</strong>
          </div>
        </div>
      </div>

      <div className="map-stage">
        <div className="map-stage-topbar">
          <div className="map-live-indicator">
            <span />
            SURVEILLANCE ACTIVE
          </div>
          <div className="map-stage-meta">
            {mapData?.taluks.length ?? 0} locations monitored
          </div>
        </div>

        <div className="map-frame">
          <KeralaMap
            mapData={mapData}
            keralaGeometry={geometry}
            clusters={clusters}
            onDistrictSelect={(id) => console.log("District selected:", id)}
            onTalukSelect={(id) => console.log("Taluk selected:", id)}
            onClusterSelect={(id) => setSelectedClusterId(id)}
          />
        </div>

        <div className="map-hud map-hud-left">
          <span className="map-hud-label">REGION</span>
          <strong>KERALA</strong>
          <span className="map-hud-sub">Disease surveillance</span>
        </div>

        <div className="map-hud map-hud-right">
          <span className="map-hud-label">AI SIGNALS</span>
          <strong>{activeSignals.toString().padStart(2, "0")}</strong>
          <span className="map-hud-sub">Temporal + spatial</span>
        </div>
      </div>

      {selectedCluster && (
        <div className="cluster-detail-card">
          <div>
            <span className="cluster-detail-eyebrow">SELECTED CLUSTER</span>
            <h2>Cluster {selectedCluster.id}</h2>
            <p>
              {selectedCluster.disease} · {selectedCluster.hotspot}
            </p>
          </div>

          <div className="cluster-detail-metrics">
            <div>
              <span>Total cases</span>
              <strong>{selectedCluster.totalCases}</strong>
            </div>
            <div>
              <span>Temporal signal</span>
              <strong>{String(selectedCluster.temporalSignal)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="cluster-close"
            onClick={() => setSelectedClusterId(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
