import './Tracking.css';
import { useEffect, useMemo, useState } from "react";
import {
  getDistricts,
  getTaluks,
  getKeralaGeometry
} from "../api/geography";
import { getDashboardMap } from "../api/dashboard";
import { getClusters } from "../api/clusters";
import KeralaMap from "../components/map/KeralaMap";
import type { MapData } from "../types/dashboard";
import type {
  District,
  Taluk,
  GeoJSONFeatureCollection
} from "../types/geography";
import type { Cluster } from "../types/clusters";

const STATES = [
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Goa',
  'Andhra Pradesh',
  'Telangana'
];

const DISEASE_PRECAUTIONS: Record<string, string[]> = {
  dengue: [
    "Remove stagnant water around homes and public areas.",
    "Use mosquito repellents and protective clothing.",
    "Keep water storage containers covered.",
    "Seek medical attention if warning symptoms develop."
  ],

  malaria: [
    "Use mosquito nets and mosquito repellents.",
    "Avoid mosquito exposure, especially during evening and night.",
    "Remove stagnant water where possible.",
    "Seek medical attention if fever or other symptoms persist."
  ],

  cholera: [
    "Drink safe and properly treated water.",
    "Wash hands thoroughly before eating and after using the toilet.",
    "Avoid contaminated food and water.",
    "Maintain proper sanitation and waste disposal."
  ],

  default: [
    "Maintain good personal hygiene.",
    "Use safe drinking water and properly handled food.",
    "Follow local public-health advisories.",
    "Seek medical attention if symptoms develop or worsen."
  ]
};

export default function Tracking() {
  const [state, setState] = useState('Kerala');
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const filteredStates = STATES.filter((item) =>
    item.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleStateSelect = (selectedState: string) => {
    setState(selectedState);
    setIsStateOpen(false);
    setStateSearch('');
  };

  const [districts, setDistricts] = useState<District[]>([]);
  const [taluks, setTaluks] = useState<Taluk[]>([]);

  const [selectedDistrict, setSelectedDistrict] =
    useState("All Districts");

  const [selectedTaluk, setSelectedTaluk] =
    useState("All Taluks");

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isTalukOpen, setIsTalukOpen] = useState(false);

  const [districtSearch, setDistrictSearch] = useState("");
  const [talukSearch, setTalukSearch] = useState("");

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTaluks, setLoadingTaluks] = useState(false);

  const [mapData, setMapData] = useState<MapData | null>(null);
  const [geometry, setGeometry] =
    useState<GeoJSONFeatureCollection | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [mapLoading, setMapLoading] = useState(true);

  const [selectedDistrictId, setSelectedDistrictId] =
    useState<string | null>(null);

  const [selectedTalukId, setSelectedTalukId] =
    useState<string | null>(null);

  const [selectedClusterId, setSelectedClusterId] =
    useState<string | null>(null);

  // Load districts when Kerala is selected
  useEffect(() => {
    if (state !== "Kerala") {
      setDistricts([]);
      setTaluks([]);
      setSelectedDistrict("All Districts");
      setSelectedTaluk("All Taluks");
      setSelectedDistrictId(null);
      setSelectedTalukId(null);
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);

        const data = await getDistricts();
        setDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [state]);

  // Load taluks when district changes
  useEffect(() => {
    if (
      state !== "Kerala" ||
      selectedDistrict === "All Districts"
    ) {
      setTaluks([]);
      setSelectedTaluk("All Taluks");
      return;
    }

    const district = districts.find(
      (item) => item.name === selectedDistrict
    );

    if (!district) {
      setTaluks([]);
      setSelectedTaluk("All Taluks");
      return;
    }

    const loadTaluks = async () => {
      try {
        setLoadingTaluks(true);

        const data = await getTaluks({
          district_id: district.id,
        });

        setTaluks(data);
      } catch (error) {
        console.error("Failed to load taluks:", error);
        setTaluks([]);
      } finally {
        setLoadingTaluks(false);
      }
    };

    loadTaluks();
  }, [state, selectedDistrict, districts]);

  // Load map data
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setMapLoading(true);

        const [mapRes, geoRes, clustersRes] = await Promise.all([
          getDashboardMap(),
          getKeralaGeometry(),
          getClusters(),
        ]);

        setMapData(mapRes);
        setGeometry(geoRes);
        setClusters(clustersRes);
      } catch (error) {
        console.error("Failed to load tracking map:", error);
      } finally {
        setMapLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Search filtering
  const filteredDistricts = useMemo(() => {
    return districts.filter((item) =>
      item.name
        .toLowerCase()
        .includes(districtSearch.toLowerCase())
    );
  }, [districts, districtSearch]);

  const filteredTaluks = useMemo(() => {
    return taluks.filter((item) =>
      item.name
        .toLowerCase()
        .includes(talukSearch.toLowerCase())
    );
  }, [taluks, talukSearch]);

  const filteredClusters = useMemo(() => {
    if (!selectedDistrictId && !selectedTalukId) {
      return clusters;
    }

    if (selectedTalukId) {
      const selectedTaluk = taluks.find(
        (item) => item.id === selectedTalukId
      );

      if (!selectedTaluk) {
        return [];
      }

      return clusters.filter((cluster) =>
        cluster.taluks.includes(selectedTaluk.name)
      );
    }

    if (selectedDistrictId) {
      const districtTalukNames = taluks
        .filter((item) => item.districtId === selectedDistrictId)
        .map((item) => item.name);

      return clusters.filter((cluster) =>
        cluster.taluks.some((talukName) =>
          districtTalukNames.includes(talukName)
        )
      );
    }

    return clusters;
  }, [
    clusters,
    selectedDistrictId,
    selectedTalukId,
    taluks
  ]);

  const selectedCluster = useMemo(() => {
    if (!selectedClusterId) {
      return null;
    }

    return clusters.find(
      (cluster) => cluster.id === selectedClusterId
    ) ?? null;
  }, [clusters, selectedClusterId]);

  const precautions = useMemo(() => {
  if (!selectedCluster) {
    return DISEASE_PRECAUTIONS.default;
  }

  const diseaseKey = selectedCluster.disease
    .toLowerCase()
    .trim();

  return (
    DISEASE_PRECAUTIONS[diseaseKey] ??
    DISEASE_PRECAUTIONS.default
  );
}, [selectedCluster]);

  // District selection
  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);

    const district = districts.find(
      (item) => item.name === districtName
    );

    if (districtName === "All Districts") {
      setSelectedDistrictId(null);
      setSelectedTalukId(null);
      setSelectedTaluk("All Taluks");
    } else {
      setSelectedDistrictId(district?.id ?? null);
      setSelectedTalukId(null);
      setSelectedTaluk("All Taluks");
    }

    setDistrictSearch("");
    setTalukSearch("");

    setIsDistrictOpen(false);
    setIsTalukOpen(false);
  };

  // Taluk selection
  const handleTalukSelect = (talukName: string) => {
    setSelectedTaluk(talukName);

    if (talukName === "All Taluks") {
      setSelectedTalukId(null);
    } else {
      const taluk = taluks.find(
        (item) => item.name === talukName
      );

      setSelectedTalukId(taluk?.id ?? null);
    }

    setTalukSearch("");
    setIsTalukOpen(false);
  };

  const handleMapDistrictSelect = (districtId: string) => {
    console.log("MAP DISTRICT CLICKED:", districtId);

    const district = districts.find(
      (item) => item.id === districtId
    );

    console.log("MATCHED DISTRICT:", district);

    if (!district) return;

    setSelectedDistrictId(district.id);
    setSelectedDistrict(district.name);

    setSelectedTalukId(null);
    setSelectedTaluk("All Taluks");

    setDistrictSearch("");
    setTalukSearch("");
  };

  const handleMapTalukSelect = (talukId: string) => {
    console.log("MAP TALUK CLICKED:", talukId);

    const taluk = mapData?.taluks.find(
      (item) => item.id === talukId
    );

    console.log("MATCHED MAP TALUK:", taluk);

    if (!taluk) return;

    setSelectedTalukId(taluk.id);
    setSelectedTaluk(taluk.name);

    setSelectedDistrictId(taluk.districtId);
    setSelectedDistrict(taluk.districtName);

    setDistrictSearch("");
    setTalukSearch("");
  };

  return (
    <div className="tracking-page">

      {/* Header */}
      <header className="tracking-header">
        <div>
          <div className="tracking-title">
            GLOBAL TRACKING
          </div>

          <div className="tracking-subtitle">
            SPATIOTEMPORAL SURVEILLANCE
          </div>
        </div>

        <div className="tracking-status">
          <span className="status-dot"></span>
          LIVE SURVEILLANCE
        </div>
      </header>


      {/* Main Tracking Section */}
      <main className="tracking-content">

        <section className="tracking-top-section">

          {/* Location */}
          <div className="tracking-panel location-panel">
            <div className="panel-label">
              LOCATION
            </div>

            {/* STATE */}
            <div className="location-field-group">
              <div className="location-field-label">
                STATE
              </div>

              <div className="state-dropdown">

                <button
                  type="button"
                  className={`state-dropdown-trigger ${
                    isStateOpen ? 'open' : ''
                  }`}
                  onClick={() =>
                    setIsStateOpen((previous) => !previous)
                  }
                >
                  <span>{state}</span>

                  <span className="dropdown-arrow">
                    {isStateOpen ? '⌃' : '⌄'}
                  </span>
                </button>

                {isStateOpen && (
                  <div className="state-dropdown-menu">

                    <div className="state-search-wrapper">
                      <span className="state-search-icon">
                        ⌕
                      </span>

                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(event) =>
                          setStateSearch(event.target.value)
                        }
                        placeholder="Search..."
                        className="state-search"
                        autoFocus
                      />
                    </div>

                    <div className="state-options">
                      {filteredStates.length > 0 ? (
                        filteredStates.map((item) => (
                          <button
                            type="button"
                            key={item}
                            className={`state-option ${
                              state === item
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              handleStateSelect(item)
                            }
                          >
                            <span>{item}</span>

                            {state === item && (
                              <span className="state-check">
                                ✓
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="no-state-results">
                          No states found
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>

              {state !== 'Kerala' && (
                <div className="state-warning">
                  ⚠ Only Kerala is currently available.
                </div>
              )}
            </div>


            {/* DISTRICT */}
            <div className="location-field-group">

              <div className="location-field-label">
                DISTRICT
              </div>

              <div className="state-dropdown">

                <button
                  type="button"
                  className={`state-dropdown-trigger ${
                    isDistrictOpen ? 'open' : ''
                  }`}
                  onClick={() =>
                    setIsDistrictOpen((previous) => !previous)
                  }
                >
                  <span>{selectedDistrict}</span>

                  <span className="dropdown-arrow">
                    {isDistrictOpen ? '⌃' : '⌄'}
                  </span>
                </button>

                {isDistrictOpen && (
                  <div className="state-dropdown-menu">

                    <div className="state-search-wrapper">
                      <span className="state-search-icon">
                        ⌕
                      </span>

                      <input
                        type="text"
                        value={districtSearch}
                        onChange={(event) =>
                          setDistrictSearch(event.target.value)
                        }
                        placeholder="Search..."
                        className="state-search"
                        autoFocus
                      />
                    </div>

                    <div className="state-options">

                      {loadingDistricts ? (
                        <div className="no-state-results">
                          Loading districts...
                        </div>
                      ) : filteredDistricts.length > 0 ? (

                        <>
                          <button
                            type="button"
                            className={`state-option ${
                              selectedDistrict === "All Districts"
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              handleDistrictSelect("All Districts")
                            }
                          >
                            <span>All Districts</span>

                            {selectedDistrict === "All Districts" && (
                              <span className="state-check">
                                ✓
                              </span>
                            )}
                          </button>

                          {filteredDistricts.map((item) => (

                            <button
                              type="button"
                              key={item.id}
                              className={`state-option ${
                                selectedDistrict === item.name
                                  ? 'selected'
                                  : ''
                              }`}
                              onClick={() =>
                                handleDistrictSelect(item.name)
                              }
                            >

                              <span>{item.name}</span>

                              {selectedDistrict === item.name && (
                                <span className="state-check">
                                  ✓
                                </span>
                              )}

                            </button>

                          ))}
                        </>

                      ) : (

                        <div className="no-state-results">
                          No districts found
                        </div>

                      )}

                    </div>

                  </div>
                )}

              </div>

            </div>


            {/* TALUK */}
            <div className="location-field-group">

              <div className="location-field-label">
                TALUK
              </div>

              <div className="state-dropdown">

                <button
                  type="button"
                  className={`state-dropdown-trigger ${
                    isTalukOpen ? 'open' : ''
                  }`}
                  onClick={() =>
                    setIsTalukOpen((previous) => !previous)
                  }
                >
                  <span>{selectedTaluk}</span>

                  <span className="dropdown-arrow">
                    {isTalukOpen ? '⌃' : '⌄'}
                  </span>
                </button>

                {isTalukOpen && (
                  <div className="state-dropdown-menu">

                    <div className="state-search-wrapper">
                      <span className="state-search-icon">
                        ⌕
                      </span>

                      <input
                        type="text"
                        value={talukSearch}
                        onChange={(event) =>
                          setTalukSearch(event.target.value)
                        }
                        placeholder="Search..."
                        className="state-search"
                        autoFocus
                      />
                    </div>

                    <div className="state-options">

                      {loadingTaluks ? (
                        <div className="no-state-results">
                          Loading taluks...
                        </div>
                      ) : selectedDistrict === "All Districts" ? (

                        <div className="no-state-results">
                          Select a district first
                        </div>

                      ) : filteredTaluks.length > 0 ? (

                        <>
                          <button
                            type="button"
                            className={`state-option ${
                              selectedTaluk === "All Taluks"
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              handleTalukSelect("All Taluks")
                            }
                          >
                            <span>All Taluks</span>

                            {selectedTaluk === "All Taluks" && (
                              <span className="state-check">
                                ✓
                              </span>
                            )}
                          </button>

                          {filteredTaluks.map((item) => (

                            <button
                              type="button"
                              key={item.id}
                              className={`state-option ${
                                selectedTaluk === item.name
                                  ? 'selected'
                                  : ''
                              }`}
                              onClick={() =>
                                handleTalukSelect(item.name)
                              }
                            >

                              <span>{item.name}</span>

                              {selectedTaluk === item.name && (
                                <span className="state-check">
                                  ✓
                                </span>
                              )}

                            </button>

                          ))}
                        </>

                      ) : (

                        <div className="no-state-results">
                          No taluks found
                        </div>

                      )}

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>


          {/* Map */}
          <div className="tracking-panel map-panel">
            <div className="panel-label">
              MAP
            </div>

            {mapLoading ? (
              <div className="map-placeholder">
                LOADING MAP
              </div>
            ) : (
              <KeralaMap
                mapData={mapData}
                keralaGeometry={geometry}
                clusters={filteredClusters}
                selectedDistrictId={selectedDistrictId}
                selectedTalukId={selectedTalukId}
                selectedClusterId={selectedClusterId}
                onDistrictSelect={handleMapDistrictSelect}
                onTalukSelect={handleMapTalukSelect}
                onClusterSelect={(id) =>
                  setSelectedClusterId(id)
                }
              />
            )}
          </div>


          {/* Disease */}
          <div className="tracking-panel disease-panel">
            <div className="panel-label">
              DISEASE
            </div>

            <div className="placeholder-field">
              {selectedCluster
                ? selectedCluster.disease
                : "SELECT CLUSTER"}
            </div>

            <div className="info-section">
              <div className="info-label">
                HOTSPOT
              </div>

              <div className="info-placeholder">
                {selectedCluster
                  ? selectedCluster.hotspot
                  : "Select a cluster from the map"}
              </div>
            </div>

            <div className="info-section">
              <div className="info-label">
                CASES
              </div>

              <div className="cases-placeholder">
                {selectedCluster
                  ? selectedCluster.totalCases
                  : "--"}
              </div>
            </div>

            <div className="info-section">
              <div className="info-label">
                TEMPORAL SIGNAL
              </div>

              <div className="info-placeholder">
                {selectedCluster
                  ? selectedCluster.temporalSignal
                  : "--"}
              </div>
            </div>

            <div className="info-section">
              <div className="info-label">
                SPATIAL CONCENTRATION
              </div>

              <div className="info-placeholder">
                {selectedCluster
                  ? selectedCluster.spatialConcentration
                  : "--"}
              </div>
            </div>
          </div>

        </section>


        {/* Precautions */}
        <section className="precautions-panel tracking-panel">
  <div className="panel-label">
    BASIC PRECAUTIONS &amp; MEASURES TO TAKE
  </div>

  <div className="precautions-content">
    {selectedCluster && (
      <div className="precautions-disease">
        FOR {selectedCluster.disease.toUpperCase()}
      </div>
    )}

    <div className="precautions-list">
      {precautions.map((precaution, index) => (
        <div
          key={index}
          className="precaution-item"
        >
          <span className="precaution-number">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="precaution-text">
            {precaution}
          </span>
        </div>
      ))}
    </div>
  </div>
</section>


        {/* Carousel */}
        <section className="carousel-section">
  <div className="infinite-slider">
    <div className="infinite-items">

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-1.png`}
        alt="Surveillance visual 1"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-2.png`}
        alt="Surveillance visual 2"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-3.png`}
        alt="Surveillance visual 3"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-4.png`}
        alt="Surveillance visual 4"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-5.png`}
        alt="Surveillance visual 5"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-6.png`}
        alt="Surveillance visual 6"
        className="infinite-item"
      />


      {/* Duplicate set for seamless infinite scrolling */}

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-1.png`}
        alt=""
        aria-hidden="true"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-2.png`}
        alt=""
        aria-hidden="true"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-3.png`}
        alt=""
        aria-hidden="true"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-4.png`}
        alt=""
        aria-hidden="true"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-5.png`}
        alt=""
        aria-hidden="true"
        className="infinite-item"
      />

      <img
        src={`${import.meta.env.BASE_URL}infinite/infinite-6.png`}
        alt=""
        aria-hidden="true"
        className="infinite-item"
      />
    </div>
  </div>
</section>

      </main>

    </div>
  );
}