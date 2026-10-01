import { useState } from 'react';
import './Tracking.css';

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

const [district, setDistrict] = useState('All Districts');
const [isDistrictOpen, setIsDistrictOpen] = useState(false);
const [districtSearch, setDistrictSearch] = useState('');

const DISTRICTS = [
  'All Districts',
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod'
];

const filteredDistricts = DISTRICTS.filter((item) =>
  item.toLowerCase().includes(districtSearch.toLowerCase())
);

const handleDistrictSelect = (selectedDistrict: string) => {
  setDistrict(selectedDistrict);
  setIsDistrictOpen(false);
  setDistrictSearch('');
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


            {/* DISTRICT - placeholder for Step 3 */}
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
      <span>{district}</span>

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

          {filteredDistricts.length > 0 ? (

            filteredDistricts.map((item) => (

              <button
                type="button"
                key={item}
                className={`state-option ${
                  district === item
                    ? 'selected'
                    : ''
                }`}
                onClick={() =>
                  handleDistrictSelect(item)
                }
              >

                <span>{item}</span>

                {district === item && (
                  <span className="state-check">
                    ✓
                  </span>
                )}

              </button>

            ))

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


            {/* TALUK - placeholder for Step 4 */}
            <div className="placeholder-field">
              TALUK
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