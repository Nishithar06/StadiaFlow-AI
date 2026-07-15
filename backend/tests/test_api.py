import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_health():
    """Test standard API health endpoint returns online status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "online"
    assert json_data["service"] == "StadiaFlow AI Backend"

def test_get_dashboard():
    """Test dashboard metrics aggregator returns correct operations console data."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    json_data = response.json()
    assert "crowd_metrics" in json_data
    assert "parking_status" in json_data
    assert "food_court_queue" in json_data
    assert "emergency_summary" in json_data
    assert "ai_insight" in json_data

def test_get_navigation():
    """Test interactive stadium navigation lists all waypoints and dynamic Layers."""
    response = client.get("/api/navigation")
    assert response.status_code == 200
    json_data = response.json()
    assert isinstance(json_data, list)
    assert len(json_data) > 0
    # Check shape of navigation waypoint
    waypoint = json_data[0]
    assert "id" in waypoint
    assert "name" in waypoint
    assert "type" in waypoint
    assert "section" in waypoint

def test_post_chat_empty():
    """Test chat query returns 400 Bad Request if the message is empty."""
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422  # Since Pydantic min_length constraint will fail validation

def test_post_chat_success():
    """Test chat query returns a response with source and similarity confidence metrics."""
    response = client.post("/api/chat", json={"message": "Where is Gate B?"})
    assert response.status_code == 200
    json_data = response.json()
    assert "reply" in json_data
    assert "source" in json_data
    assert "timestamp" in json_data
    assert "confidence" in json_data
