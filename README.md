# StadiumPilot AI 🏟️

Smart Stadium Assistant for FIFA World Cup 2026.

StadiumPilot AI is a production-ready, modular full-stack application designed to enhance fan experience, manage stadium crowds, and facilitate emergency response handling during the FIFA World Cup 2026.

---

## Architecture Overview

The system is split into three main parts:
1. **Frontend**: A high-performance, single-page application built using React (Vite), Tailwind CSS (v4), Axios, and React Router.
2. **Backend**: A modular FastAPI service implemented in Python, handling API routes, settings management, mock data handling, and Google Gemini API integration.
3. **Docs**: Technical design specifications, including API endpoints, system architecture, and custom AI prompt designs.

```
StadiumPilot-AI/
├── backend/            # FastAPI Backend
│   ├── app/            # Core application code
│   └── data/           # Mock data JSONs (live simulation)
├── frontend/           # React Frontend (Vite)
│   ├── src/            # Components, pages, styling, services
│   └── public/         # Static assets
└── docs/               # System documentation & AI prompt designs
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+)

### Installation & Setup

For detailed startup instructions, refer to individual README files:
- 🚀 **Frontend Setup**: Read the [Frontend README](file:///d:/StadiumPilot-AI/frontend/README.md)
- ⚙️ **Backend Setup**: Read the [Backend README](file:///d:/StadiumPilot-AI/backend/README.md)

---

## Key Features (MVP)
- **Interactive AI Assistant**: Personalized visitor queries (tickets, seating, food, transit).
- **Live Crowd Monitoring**: Real-time checkpoint flow rates, wait times, and queue status.
- **Incident reporting & dispatching**: Real-time notifications for stadium staff and medical teams.
