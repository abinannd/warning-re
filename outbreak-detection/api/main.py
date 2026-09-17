from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
import pandas as pd
import os
from typing import Optional

# Internal imports
from schemas import HealthResponse, ResponseWrapper

app = FastAPI(
    title="AI Outbreak Detection API",
    description="Backend API for spatiotemporal outbreak visualization",
    version="1.0.0"
)

# CORS configuration: Allow permissive local origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:8080", "http://localhost:3000", "http://127.0.0.1", "http://127.0.0.1:8080", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data paths
DATA_DIR = r"c:\BRAIN-STORM\warning-re\outbreak-detection\data"
HEATMAP_CSV = os.path.join(DATA_DIR, "phase4_heatmap_data.csv")
CLUSTERS_CSV = os.path.join(DATA_DIR, "phase4_outbreak_clusters.csv")
SOURCE_MAP_CSV = os.path.join(DATA_DIR, "phase4_source_map.csv")
DISTRICT_SUMM_CSV = os.path.join(DATA_DIR, "phase4_district_summary.csv")
STATE_SUMM_CSV = os.path.join(DATA_DIR, "phase4_state_summary.csv")

# In-memory cached DataFrames
cache = {}

@app.on_event("startup")
def load_data():
    try:
        if os.path.exists(HEATMAP_CSV):
            cache['heatmap'] = pd.read_csv(HEATMAP_CSV, parse_dates=['date'])
        if os.path.exists(CLUSTERS_CSV):
            cache['clusters'] = pd.read_csv(CLUSTERS_CSV, parse_dates=['date'])
        if os.path.exists(SOURCE_MAP_CSV):
            cache['sources'] = pd.read_csv(SOURCE_MAP_CSV, parse_dates=['date'])
        if os.path.exists(DISTRICT_SUMM_CSV):
            cache['districts'] = pd.read_csv(DISTRICT_SUMM_CSV, parse_dates=['date'])
        if os.path.exists(STATE_SUMM_CSV):
            cache['states'] = pd.read_csv(STATE_SUMM_CSV, parse_dates=['date'])
    except Exception as e:
        print(f"Error loading datasets: {e}")

def filter_dataframe(df: pd.DataFrame, 
                     disease: Optional[str] = None, 
                     start_date: Optional[date] = None, 
                     end_date: Optional[date] = None, 
                     state: Optional[str] = None, 
                     district: Optional[str] = None,
                     taluk: Optional[str] = None) -> pd.DataFrame:
    filtered = df.copy()
    if disease:
        filtered = filtered[filtered['disease'].str.lower() == disease.lower()]
    if start_date:
        filtered = filtered[filtered['date'].dt.date >= start_date]
    if end_date:
        filtered = filtered[filtered['date'].dt.date <= end_date]
    if state and 'state' in filtered.columns:
        filtered = filtered[filtered['state'].str.lower() == state.lower()]
    if district and 'district' in filtered.columns:
        filtered = filtered[filtered['district'].str.lower() == district.lower()]
    if taluk and 'taluk' in filtered.columns:
        filtered = filtered[filtered['taluk'].str.lower() == taluk.lower()]
    
    return filtered

def prepare_response(df: pd.DataFrame) -> dict:
    # Fill NaN with None for JSON serialization
    df_clean = df.where(pd.notnull(df), None)
    # Convert dates to string representation
    if 'date' in df_clean.columns:
        df_clean['date'] = df_clean['date'].dt.strftime('%Y-%m-%d')
    records = df_clean.to_dict(orient="records")
    return {
        "status": "success",
        "count": len(records),
        "data": records
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}

@app.get("/api/diseases", response_model=ResponseWrapper)
def get_diseases():
    if 'heatmap' not in cache:
        raise HTTPException(status_code=500, detail="Data not loaded")
    df = cache['heatmap']
    diseases = df['disease'].dropna().unique().tolist()
    return {
        "status": "success",
        "count": len(diseases),
        "data": diseases
    }

@app.get("/api/heatmap", response_model=ResponseWrapper)
def get_heatmap(
    disease: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    taluk: Optional[str] = None
):
    if 'heatmap' not in cache:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    df = cache['heatmap']
    filtered_df = filter_dataframe(df, disease, start_date, end_date, state, district, taluk)
    return prepare_response(filtered_df)

@app.get("/api/hotspots", response_model=ResponseWrapper)
def get_hotspots(
    disease: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    state: Optional[str] = None,
    district: Optional[str] = None
):
    if 'clusters' not in cache:
        raise HTTPException(status_code=500, detail="Clusters data not loaded")
    
    df = cache['clusters']
    filtered_df = filter_dataframe(df, disease, start_date, end_date, state, district)
    return prepare_response(filtered_df)

@app.get("/api/sources", response_model=ResponseWrapper)
def get_sources(
    disease: Optional[str] = None
):
    if 'sources' not in cache:
        raise HTTPException(status_code=500, detail="Source map data not loaded")
    
    df = cache['sources']
    if disease:
        df = df[df['disease'].str.lower() == disease.lower()]
    return prepare_response(df)

@app.get("/api/districts", response_model=ResponseWrapper)
def get_districts(
    disease: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    state: Optional[str] = None
):
    if 'districts' not in cache:
        raise HTTPException(status_code=500, detail="District data not loaded")
    
    df = cache['districts']
    filtered_df = filter_dataframe(df, disease, start_date, end_date, state)
    return prepare_response(filtered_df)

@app.get("/api/states", response_model=ResponseWrapper)
def get_states(
    disease: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    if 'states' not in cache:
        raise HTTPException(status_code=500, detail="State data not loaded")
    
    df = cache['states']
    filtered_df = filter_dataframe(df, disease, start_date, end_date)
    return prepare_response(filtered_df)
