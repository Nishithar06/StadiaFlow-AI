# StadiaFlow AI - Frontend 🏟️

High-fidelity React Single Page Application for StadiaFlow AI, optimized for FIFA World Cup 2026 stadium navigation and operations.

---

## Technical Stack
- **Framework**: React (scaffolded via Vite)
- **Styling**: Tailwind CSS (v4) with native CSS-first configuration
- **Routing**: React Router DOM (v6)
- **API Client**: Axios
- **Icons**: Lucide React

---

## Folder Structure
```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable layout UI components (Header, Footer)
│   ├── pages/            # Core views (LandingPage - containing interactive telemetries)
│   ├── services/         # API connection handlers (api.js)
│   ├── App.jsx           # Main routing & layout bootstrap
│   ├── index.css         # Global tailwind directives & custom styles
│   └── main.jsx          # Entrypoint rendering to index.html
├── .env.example          # Environment variables template
├── package.json          # Node scripts and dependencies
├── vite.config.js        # Vite config with `@tailwindcss/vite`
└── README.md             # This document
```

---

## Setup & Startup Instructions

### 1. Prerequisites
- Node.js v18 or higher
- npm (Node Package Manager)

### 2. Install Dependencies
From the `frontend` folder, run:
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

### 4. Build for Production
To bundle and compile optimized production assets:
```bash
npm run build
```
The compiled output will be generated inside the `dist/` directory.

---

## Integration Highlights
- **Axios Client**: Configured in [api.js](file:///d:/StadiumPilot-AI/frontend/src/services/api.js) to dynamically connect to the FastAPI backend URL defined in `.env`.
- **Gemini Chat Component**: Connects to the `/gemini/chat` REST endpoint to query Gemini system instructions from docs.
- **Auto-fallback**: Dynamically displays simulated values locally when the backend FastAPI is offline, keeping the app functional for demonstrations.
