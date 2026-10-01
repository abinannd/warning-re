import './Tracking.css';
import { useEffect, useMemo, useState } from "react";
import { getDistricts, getTaluks } from "../api/geography";
import type { District, Taluk } from "../types/geography";
const STATES = [
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Goa',
  'Andhra Pradesh',
  'Telangana'
];

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

  // Load districts when Kerala is selected
  useEffect(() => {
    if (state !== "Kerala") {
      setDistricts([]);
      setTaluks([]);
      setSelectedDistrict("All Districts");
      setSelectedTaluk("All Taluks");
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

  // District selection
  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedTaluk("All Taluks");

    setDistrictSearch("");
    setTalukSearch("");

    setIsDistrictOpen(false);
    setIsTalukOpen(false);
  };

  // Taluk selection
  const handleTalukSelect = (talukName: string) => {
    setSelectedTaluk(talukName);

    setTalukSearch("");
    setIsTalukOpen(false);
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

            <div className="map-placeholder">
              MAP
            </div>
          </div>


          {/* Disease */}
          <div className="tracking-panel disease-panel">
            <div className="panel-label">
              DISEASE
            </div>

            <div className="placeholder-field">
              SELECT DISEASE
            </div>

            <div className="info-section">
              <div className="info-label">
                SYMPTOMS
              </div>

              <div className="info-placeholder">
                General symptoms
              </div>
            </div>

            <div className="info-section">
              <div className="info-label">
                CASES
              </div>

              <div className="cases-placeholder">
                --
              </div>
            </div>
          </div>

        </section>


        {/* Precautions */}
        <section className="precautions-panel tracking-panel">
          <div className="panel-label">
            BASIC PRECAUTIONS &amp; MEASURES TO TAKE
          </div>

          <div className="precautions-placeholder">
            Advisory information will appear here.
          </div>
        </section>


        {/* Carousel */}
        <section className="carousel-section">
          <div className="carousel-placeholder">
            INFINITE CAROUSEL
          </div>
        </section>

      </main>

    </div>
  );
}