# API Design Specification - StadiumPilot AI

All API endpoints are versioned and prefixed with `/api/v1`.

---

## 1. System Health Check

### `GET /api/v1/health`
Verifies that the FastAPI application is alive and configuration settings are successfully loaded.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## 2. Gemini AI Assistant Endpoints

### `POST /api/v1/gemini/chat`
Submits a user query to the AI Assistant for natural language processing using FIFA World Cup 2026 stadium contexts.

**Request Body:**
```json
{
  "message": "How do I get to seating Section 204 from Gate B?",
  "session_id": "session-uuid-12345"
}
```

**Response (200 OK):**
```json
{
  "response": "To reach Section 204 from Gate B, follow the main concourse path eastward. Turn left at Section 108 and take the escalator to Level 2. Section 204 will be immediately on your right.",
  "session_id": "session-uuid-12345",
  "timestamp": "2026-07-13T19:04:00Z"
}
```

---

## 3. Stadium Locations & Directory

### `GET /api/v1/stadium/locations`
Retrieves mock locations in the stadium, including Gates, Food Concessions, Restrooms, and First Aid.

**Response (200 OK):**
```json
[
  {
    "id": "loc-1",
    "name": "Gate A (Main Entrance)",
    "type": "gate",
    "section": "100",
    "coordinates": {"lat": 34.0522, "lng": -118.2437}
  },
  {
    "id": "loc-2",
    "name": "Taco Corner Concession",
    "type": "concession",
    "section": "104",
    "coordinates": {"lat": 34.0525, "lng": -118.2439}
  }
]
```

---

## 4. Crowd Status Dashboard

### `GET /api/v1/crowd/status`
Fetches simulated live status of gates and entrance queues.

**Response (200 OK):**
```json
{
  "checkpoints": [
    {
      "id": "gate-a",
      "name": "Gate A Entrance",
      "status": "normal",
      "wait_time_minutes": 5,
      "density_level": "low",
      "flow_rate_per_min": 45
    },
    {
      "id": "gate-b",
      "name": "Gate B Entrance",
      "status": "congested",
      "wait_time_minutes": 25,
      "density_level": "high",
      "flow_rate_per_min": 12
    }
  ],
  "last_updated": "2026-07-13T19:04:00Z"
}
```

---

## 5. Emergency Incident Reports

### `GET /api/v1/emergency/reports`
Retrieves live simulated active emergency logs for stadium operators and first responders.

**Response (200 OK):**
```json
[
  {
    "id": "report-101",
    "type": "medical",
    "severity": "high",
    "location": "Section 104, Row 12",
    "description": "Spectator experiencing heat exhaustion symptoms.",
    "status": "dispatched",
    "reported_at": "2026-07-13T18:50:00Z"
  }
]
```

### `POST /api/v1/emergency/reports`
Submits a new emergency incident. Used by stadium staff or AI trigger systems.

**Request Body:**
```json
{
  "type": "spill_hazard",
  "severity": "medium",
  "location": "Concourse near Gate B",
  "description": "Large beverage spill causing slipping hazard on smooth concrete floor."
}
```

**Response (201 Created):**
```json
{
  "id": "report-102",
  "type": "spill_hazard",
  "severity": "medium",
  "location": "Concourse near Gate B",
  "description": "Large beverage spill causing slipping hazard on smooth concrete floor.",
  "status": "pending",
  "reported_at": "2026-07-13T19:04:15Z"
}
```
