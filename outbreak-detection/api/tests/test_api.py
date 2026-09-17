import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path to import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app, load_data

# Ensure data is loaded
load_data()

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_diseases():
    response = client.get("/api/diseases")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    assert isinstance(data["data"], list)

def test_get_heatmap():
    response = client.get("/api/heatmap")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    
def test_get_heatmap_filter_valid_disease():
    response = client.get("/api/heatmap?disease=dengue")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    
def test_get_heatmap_filter_invalid_disease():
    response = client.get("/api/heatmap?disease=nonexistent_disease")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["count"] == 0

def test_get_heatmap_filter_invalid_date():
    response = client.get("/api/heatmap?start_date=invalid_date")
    assert response.status_code == 422 # FastAPI validation error

def test_get_hotspots():
    response = client.get("/api/hotspots")
    assert response.status_code == 200
    
def test_get_sources():
    response = client.get("/api/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_cors():
    response = client.options("/api/heatmap", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"})
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
