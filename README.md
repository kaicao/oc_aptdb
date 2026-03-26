# OC_APTDB - Oslo Real Estate Project

A comprehensive real estate platform for Oslo, Norway.

## Features

- Property listings and search
- Interactive map integration
- User authentication
- Property details and galleries
- Contact forms

## Tech Stack

- **Backend:** Python FastAPI
- **Frontend:** React with TypeScript
- **Database:** SQLite (development) / PostgreSQL (production)
- **Maps:** Leaflet
- **Styling:** Tailwind CSS

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Structure
```
oc_aptdb/
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── docs/             # Documentation
├── tests/            # Test files
├── requirements.txt  # Python dependencies
└── package.json      # Node.js dependencies
```