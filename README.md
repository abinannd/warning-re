# UT WATCH

> **AI-Assisted Spatiotemporal Outbreak Surveillance and Intelligence
> Platform**

UT WATCH is an AI-assisted surveillance platform for analysing disease
surveillance data, detecting potential outbreak signals, localising
affected areas, identifying spatial-temporal clusters, and presenting
surveillance intelligence through an interactive web application.

------------------------------------------------------------------------

## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [Objectives](#2-objectives)
3.  [Key Features](#3-key-features)
4.  [System Architecture](#4-system-architecture)
5.  [Project Workflow](#5-project-workflow)
6.  [Technology Stack](#6-technology-stack)
7.  [Machine Learning Pipeline](#7-machine-learning-pipeline)
8.  [Data Pipeline](#8-data-pipeline)
9.  [Backend Architecture](#9-backend-architecture)
10. [Frontend Architecture](#10-frontend-architecture)
11. [API Modules](#11-api-modules)
12. [Geospatial Intelligence](#12-geospatial-intelligence)
13. [Surveillance, Alerts & Advisory](#13-surveillance-alerts--advisory)
14. [Project Structure](#14-project-structure)
15. [Installation & Setup](#15-installation--setup)
16. [Running the Application](#16-running-the-application)
17. [API Endpoints](#17-api-endpoints)
18. [Testing](#18-testing)
19. [Deployment](#19-deployment)
20. [Current Scope & Limitations](#20-current-scope--limitations)
21. [Future Enhancements](#21-future-enhancements)
22. [Project Information](#22-project-information)

------------------------------------------------------------------------

## 1. Project Overview

UT WATCH combines **machine learning, spatiotemporal feature
engineering, geospatial analysis, and web technologies** to provide a
unified disease surveillance interface.

The platform processes surveillance observations containing geographic,
temporal, disease, case, death, and environmental information.
Engineered features are supplied to a machine-learning pipeline, whose
outputs are transformed into signals, candidate clusters, alerts, and
advisory information.

### Core Architecture

``` text
┌───────────────────────┐
│  Surveillance Dataset │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Data Cleaning &       │
│ Standardisation       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Spatiotemporal Feature│
│ Engineering           │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Machine Learning      │
│ Outbreak Detection    │
└───────────┬───────────┘
            │
     ┌──────┼─────────┐
     ▼      ▼         ▼
  Signals Clusters  Probability
     │      │         │
     └──────┼─────────┘
            ▼
┌───────────────────────┐
│      FastAPI          │
│      REST API         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ React + TypeScript    │
│ Web Application       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ UT WATCH Surveillance │
│ Interface             │
└───────────────────────┘
```

------------------------------------------------------------------------

## 2. Objectives

-   Detect unusual disease activity from surveillance observations.
-   Identify potential outbreak events using machine learning.
-   Localise surveillance activity at district and taluk level.
-   Analyse spatial and temporal disease patterns.
-   Group related observations into candidate spatial-temporal clusters.
-   Provide interactive map-based surveillance intelligence.
-   Expose alerts and advisory information through a REST API.
-   Provide a structured surveillance-cycle workflow.

------------------------------------------------------------------------

## 3. Key Features

### Disease Surveillance

Disease, case, death, temporal, geographic, and environmental
observations are processed into a surveillance-oriented data pipeline.

### AI-Based Outbreak Detection

A Random Forest classifier is used in the current model pipeline to
classify potential outbreak events.

### Spatial Intelligence

Signals are associated with geographic coordinates and administrative
areas.

### Cluster Analysis

Potentially related observations are grouped using spatial and temporal
constraints.

### Interactive Global Tracking

The tracking interface provides:

``` text
State → District → Taluk → Local Surveillance Intelligence
```

The current operational geographic focus is Kerala.

### Interactive Map

The map supports:

-   District boundaries
-   Taluk-level observations
-   Surveillance signals
-   Candidate clusters
-   Selection and zooming
-   Cluster tooltips

### Intelligence Dashboard

The platform exposes:

-   Trends
-   Signals
-   Clusters
-   Alerts
-   Advisory information
-   Surveillance-cycle information

------------------------------------------------------------------------

## 4. System Architecture

### End-to-End Block Diagram

``` mermaid
flowchart TB
    A[Surveillance Data] --> B[Cleaning & Standardisation]
    B --> C[Spatiotemporal Feature Engineering]
    C --> D[Machine Learning]
    D --> E[Outbreak Signals]
    D --> F[Probability / Intensity]
    E --> G[Spatial-Temporal Clustering]
    F --> G
    E --> H[Alerts]
    F --> I[Advisory]
    G --> J[Clusters]

    E --> K[FastAPI]
    H --> K
    I --> K
    J --> K
    K --> L[REST API]
    L --> M[Axios API Client]
    M --> N[React + TypeScript]
    N --> O[Dashboard]
    N --> P[Global Tracking]
    N --> Q[Interactive Map]
    N --> R[Intelligence]
    N --> S[Clusters]
    N --> T[Alerts]
    N --> U[Advisory]
    N --> V[Surveillance]
```

### Layered Architecture

``` text
┌────────────────────────────────────────────────────────────┐
│ PRESENTATION                                               │
│ React • TypeScript • CSS • Leaflet • Chart.js             │
├────────────────────────────────────────────────────────────┤
│ API                                                        │
│ FastAPI • REST • Axios                                    │
├────────────────────────────────────────────────────────────┤
│ INTELLIGENCE                                               │
│ ML Predictions • Signals • Clusters • Alerts • Advisory   │
├────────────────────────────────────────────────────────────┤
│ DATA PROCESSING                                            │
│ Cleaning • Feature Engineering • Aggregation              │
├────────────────────────────────────────────────────────────┤
│ DATA                                                       │
│ Disease • Geographic • Temporal • Environmental Records   │
└────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## 5. Project Workflow

``` text
Phase 1
Data Cleaning
      ↓
Phase 2
Spatiotemporal Feature Engineering
      ↓
Phase 3
Outbreak Detection & Model Selection
      ↓
Phase 4
Spatial Visualisation & Cluster Analysis
      ↓
Phase 5
FastAPI + Frontend Integration
```

### Phase 1 --- Data Preparation

-   Standardise columns.
-   Remove duplicates.
-   Standardise disease categories.
-   Correct temporal inconsistencies.
-   Prepare geographic information.

### Phase 2 --- Feature Engineering

Feature groups include:

-   Temporal lags
-   Rolling statistics
-   Change / velocity features
-   Seasonal encodings
-   Spatial features
-   Disease-specific features
-   Baseline features
-   Outbreak-oriented features
-   Imputation indicators

The feature pipeline is designed to avoid using future observations as
model inputs.

### Phase 3 --- Outbreak Detection

The current implementation uses a **Random Forest classifier**.
Candidate approaches are evaluated using a temporal validation strategy,
with **AUPRC** used for model selection.

### Phase 4 --- Spatial Intelligence

Model outputs are transformed into:

-   Outbreak observations
-   Probability/intensity values
-   Spatial signals
-   Candidate clusters
-   Cluster epicentres
-   Cluster statistics

### Phase 5 --- Integration

FastAPI exposes the processed intelligence through REST endpoints, and
the React frontend consumes those endpoints.

------------------------------------------------------------------------

## 6. Technology Stack

  Layer               Technology
  ------------------- ---------------------------------
  Language            Python 3.10.6
  Machine Learning    scikit-learn / Random Forest
  Data Processing     Pandas, NumPy
  Backend             FastAPI 0.115.0
  ASGI Server         Uvicorn 0.30.6
  Frontend            React 19.2
  Frontend Language   TypeScript
  Build Tool          Vite 8.3.0
  HTTP Client         Axios
  Mapping             Leaflet / React-Leaflet
  Charts              Chart.js
  Styling             CSS / Tailwind-based components
  Geographic Format   GeoJSON
  Testing             Pytest
  Version Control     Git / GitHub

------------------------------------------------------------------------

## 7. Machine Learning Pipeline

### Current Model

**Random Forest Classifier**

The current model-selection workflow uses temporal validation and AUPRC.

### Outbreak Label Concept

The current outbreak-event label is based on future case behaviour:

``` text
next_cases > 5
        AND
(
    next_cases > historical_max × 1.5
    OR
    next_cases > historical_mean + 2 × historical_std
)
```

The future observation is used to create the label rather than being
supplied as an input feature.

### Temporal Evaluation

``` text
Earlier Observations
        │
        ▼
┌──────────────┐
│    TRAIN     │
└──────┬───────┘
       ▼
┌──────────────┐
│  VALIDATION  │
└──────┬───────┘
       ▼
┌──────────────┐
│     TEST     │
└──────────────┘
```

A chronological split is used instead of a random split to better
represent deployment on future observations.

------------------------------------------------------------------------

## 8. Data Pipeline

The surveillance dataset contains fields representing:

  Category       Examples
  -------------- ---------------------------------
  Geography      State, District, Taluk
  Coordinates    Latitude, Longitude
  Disease        Disease category
  Epidemiology   Cases, Deaths
  Time           Week, Day, Month, Year
  Environment    Precipitation, Temperature, LAI

### Feature Engineering Structure

``` text
                         Raw Data
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     Temporal           Spatial           Disease
     Features           Features          Features
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                   Environmental Data
                            │
                            ▼
                Baseline / Outbreak Features
                            │
                            ▼
                    ML-Ready Dataset
```

------------------------------------------------------------------------

## 9. Backend Architecture

The backend uses **FastAPI** and **Uvicorn**.

### Responsibilities

-   Dashboard summary and map data
-   Intelligence trends and signals
-   Cluster retrieval
-   Alert generation
-   Advisory generation
-   Surveillance-cycle operations
-   Geographic lookup
-   Geographic geometry
-   Report submission/validation
-   Health checks

### Request Flow

``` text
React Frontend
      │
      │ HTTP
      ▼
┌───────────────┐
│    FastAPI    │
├───────────────┤
│ Dashboard     │
│ Intelligence  │
│ Clusters      │
│ Alerts        │
│ Advisory      │
│ Surveillance  │
│ Geography     │
└───────┬───────┘
        ▼
Processed ML / Surveillance Data
```

------------------------------------------------------------------------

## 10. Frontend Architecture

The frontend is built with **React 19.2, TypeScript, and Vite**.

### Main Sections

-   Landing
-   Dashboard
-   Global Tracking
-   Map
-   Intelligence
-   Clusters
-   Alerts
-   Advisory
-   Surveillance

### Frontend Data Flow

``` text
FastAPI
   ↓
Axios API Client
   ↓
Typed API Modules
   ↓
React Components
   ↓
UI / Map / Charts
```

### Mapping

The map layer uses:

-   Leaflet
-   React-Leaflet
-   GeoJSON
-   Latitude/longitude observations
-   District layers
-   Taluk markers
-   Signal layers
-   Cluster overlays

------------------------------------------------------------------------

## 11. API Modules

### Dashboard

``` text
GET /api/dashboard/summary
GET /api/dashboard/map
```

### Intelligence

``` text
GET /api/intelligence/trends
GET /api/intelligence/signals
```

### Clusters

``` text
GET /api/clusters
GET /api/clusters/{cluster_id}
```

### Alerts & Advisory

``` text
GET /api/alerts
GET /api/advisory
```

### Surveillance

``` text
GET  /api/surveillance/cycle/current
GET  /api/surveillance/cycle/{cycle_id}
GET  /api/surveillance/cycle/{id}/status
POST /api/surveillance/reports
POST /api/surveillance/reports/validate
```

### Geography

``` text
GET /api/geography/districts
GET /api/geography/taluks
GET /api/geography/taluks/{taluk_id}/geometry
GET /api/geography/districts/{district_id}/geometry
GET /api/geography/kerala
```

------------------------------------------------------------------------

## 12. Geospatial Intelligence

Geospatial analysis is a core component of UT WATCH.

The system works with:

-   State
-   District
-   Taluk
-   Latitude
-   Longitude
-   Disease
-   Cases
-   Outbreak probability/intensity
-   Cluster information

### Location Selection

``` text
State
  ↓
District
  ↓
Taluk
  ↓
Surveillance Intelligence
```

### Map Components

``` text
                Kerala Map
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 District Layer             Taluk Layer
        │                       │
        └───────────┬───────────┘
                    ▼
              Signal Layer
                    │
                    ▼
              Cluster Layer
                    │
                    ▼
                Tooltips
```

------------------------------------------------------------------------

## 13. Surveillance, Alerts & Advisory

### Alerts

Alerts are derived from model-generated outbreak signals and expose
information such as:

-   Disease
-   Location
-   Probability/intensity
-   Severity
-   Time information

### Advisory

The advisory service provides information associated with available
surveillance signals. Model output should be interpreted as
**decision-support information**, not as confirmation of an
epidemiological outbreak.

### Surveillance Cycle

``` text
Current Cycle
     │
     ├── Cycle Information
     ├── Cycle Status
     ├── Surveillance Reports
     └── Report Validation
```

------------------------------------------------------------------------

## 14. Project Structure

``` text
warning-re/
│
├── outbreak-detection/
│   ├── api/
│   │   ├── main.py
│   │   └── tests/
│   │       └── test_api.py
│   ├── data/
│   ├── models/
│   ├── processing/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   └── map/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
└── README.md
```

------------------------------------------------------------------------

## 15. Installation & Setup

### Prerequisites

-   Python 3.10+
-   Node.js
-   npm
-   Git

### Clone

``` bash
git clone https://github.com/abinannd/warning-re.git
cd warning-re
```

### Backend

``` bash
cd outbreak-detection
```

Install the dependencies defined by the backend project, then run:

``` bash
uvicorn api.main:app --reload --port 8000
```

Backend:

``` text
http://localhost:8000
```

### Frontend

In a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 16. Running the Application

Start the backend:

``` bash
cd outbreak-detection
uvicorn api.main:app --reload --port 8000
```

Start the frontend:

``` bash
cd frontend
npm run dev
```

Open:

``` text
http://localhost:5173
```

### Development Request Flow

``` text
Browser
   │
   ▼
Vite / React :5173
   │
   │ /api/*
   ▼
FastAPI :8000
   │
   ▼
ML + Surveillance Data
```

------------------------------------------------------------------------

## 17. API Endpoints

  ---------------------------------------------------------------------------------------------------
  Module                  Method                  Endpoint
  ----------------------- ----------------------- ---------------------------------------------------
  Health                  GET                     `/health`

  Dashboard               GET                     `/api/dashboard/summary`

  Map                     GET                     `/api/dashboard/map`

  Trends                  GET                     `/api/intelligence/trends`

  Signals                 GET                     `/api/intelligence/signals`

  Clusters                GET                     `/api/clusters`

  Cluster Detail          GET                     `/api/clusters/{cluster_id}`

  Alerts                  GET                     `/api/alerts`

  Advisory                GET                     `/api/advisory`

  Current Cycle           GET                     `/api/surveillance/cycle/current`

  Cycle Detail            GET                     `/api/surveillance/cycle/{cycle_id}`

  Submit Report           POST                    `/api/surveillance/reports`

  Validate Report         POST                    `/api/surveillance/reports/validate`

  Cycle Status            GET                     `/api/surveillance/cycle/{id}/status`

  Districts               GET                     `/api/geography/districts`

  Taluks                  GET                     `/api/geography/taluks`

  Taluk Geometry          GET                     `/api/geography/taluks/{taluk_id}/geometry`

  District Geometry       GET                     `/api/geography/districts/{district_id}/geometry`

  Kerala Geometry         GET                     `/api/geography/kerala`
  ---------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 18. Testing

Backend API tests are located under:

``` text
outbreak-detection/api/tests/
```

Run:

``` bash
pytest
```

The test suite covers major areas including:

-   Health
-   Dashboard
-   Map schema
-   Coordinate validation
-   Trends
-   Signals
-   Clusters
-   Alerts
-   Advisory
-   Surveillance cycles
-   Geography
-   CORS
-   JSON/NaN safety

------------------------------------------------------------------------

## 19. Deployment

The frontend is configured for Vite-based deployment and repository-path
hosting where required.

The Vite configuration uses:

``` text
/warning-re/
```

as the deployment base path, while React Router uses the corresponding
Vite base URL.

Build:

``` bash
npm run build
```

For production deployment, configure:

-   Frontend hosting
-   Backend hosting
-   Production API URL
-   CORS
-   Environment variables
-   Static/geographic assets
-   HTTPS

------------------------------------------------------------------------

## 20. Current Scope & Limitations

-   The current tracking workflow is focused on Kerala.
-   Surveillance report submission is not yet a complete persistent
    database workflow.
-   Geographic fallback representations may use coordinate-based
    features when authoritative boundary GeoJSON is unavailable.
-   Model outputs are surveillance signals and should not automatically
    be interpreted as confirmed outbreaks.
-   System performance depends on the quality, completeness, temporal
    coverage, and geographic resolution of the underlying data.

------------------------------------------------------------------------

## 21. Future Enhancements

-   Real-time surveillance ingestion
-   Persistent report database
-   Authentication and role-based access
-   Population-normalised incidence
-   Additional environmental datasets
-   Health infrastructure datasets
-   Authoritative administrative boundaries
-   Automated notifications
-   Advanced cluster analytics
-   Model explainability
-   Model drift monitoring
-   Multi-state expansion
-   Production database integration
-   Docker/container deployment
-   CI/CD
-   Report export and analytics

------------------------------------------------------------------------

## 22. Project Information

**Project:** UT WATCH --- AI-Assisted Spatiotemporal Outbreak
Surveillance

**Repository:** https://github.com/abinannd/warning-re

### Primary Domains

``` text
Artificial Intelligence
Machine Learning
Public Health Surveillance
Geospatial Intelligence
Spatiotemporal Analytics
Web Application Development
```

### Development Stack

``` text
Frontend        → React + TypeScript + Vite
Backend         → FastAPI + Uvicorn
Machine Learning→ Python + scikit-learn
Data            → Pandas + NumPy
Maps            → Leaflet + React-Leaflet
Charts          → Chart.js
API             → REST + Axios
Version Control → Git + GitHub
```

------------------------------------------------------------------------

## Project Summary

``` text
                     UT WATCH
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          DETECT      LOCALISE    VISUALISE
             │           │           │
             └───────────┼───────────┘
                         ▼
               SURVEILLANCE INTELLIGENCE
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Signals    Clusters    Alerts
                         │
                         ▼
                  Decision Support
```

> **UT WATCH --- Turning surveillance data into actionable
> spatiotemporal intelligence.**