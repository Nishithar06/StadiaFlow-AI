# StadiaFlow AI - Backend ⚙️

FastAPI backend server for the StadiaFlow AI application.

---

## Technical Stack
- **Framework**: FastAPI (ASGI python framework)
- **Settings Management**: Pydantic v2 Settings Configuration
- **AI Core**: Google Gemini SDK Integration
- **Server**: Uvicorn

---

## Folder Structure
```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/    # Route files (gemini.py, stadium.py)
│   ├── core/
│   │   └── config.py     # Pydantic Settings
│   ├── services/
│   │   └── gemini.py     # Gemini client & mock model logic
│   └── main.py           # App bootstrap and CORS configuration
├── data/                 # Simulated telemetry JSONs
│   ├── crowd_status.json
│   ├── emergency_reports.json
│   └── stadium_locations.json
├── .env.example          # Template configuration
├── requirements.txt      # Python dependencies
└── README.md             # This document
```

---

## Local Setup

### 1. Prerequisites
- Python 3.9 or higher

### 2. Create Virtual Environment
From the `backend` folder, run:
```bash
python -m venv .venv
```

Activate the environment:
- **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- **Linux / macOS**:
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configuration
Copy the `.env.example` to `.env` (we have pre-created a default `.env` for your local development):
```bash
cp .env.example .env
```
To enable live AI features, replace `your_gemini_api_key_here` inside `.env` with a real Google Gemini API Key.

### 5. Run the Server
Start the Uvicorn development server:
```bash
uvicorn app.main:app --reload
```
The backend will run on `http://127.0.0.1:8000`.

---

## API Testing

- **Interactive Documentation (Swagger)**: Visit `http://127.0.0.1:8000/docs` in your browser.
- **Health Check**: Open `http://127.0.0.1:8000/api/v1/health`.
