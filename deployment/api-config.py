# Production API Configuration for Oslo Apartments

# Backend API endpoints
API_BASE_URL = "https://oslo-apartments-api.netlify.app"
API_ENDPOINTS = {
    "apartments": "/apartments",
    "apartments_history": "/apartments/{id}/history", 
    "districts": "/districts",
    "analytics": "/analytics/market-overview"
}

# Frontend environment configuration
FRONTEND_CONFIG = {
    "apiBaseUrl": "https://oslo-apartments-api.netlify.app",
    "mapCenter": [59.9139, 10.7522],  # Oslo center
    "mapZoom": 12,
    "defaultLanguage": "no",
    "supportedLanguages": ["no", "en", "zh"]
}

# Database configuration
DATABASE_CONFIG = {
    "path": "oslo_realestate.db",
    "apartments": 200,
    "transactions": 396,
    "districts": 24,
    "last_updated": "2025-03-26",
    "data_source": "Current Oslo real estate market data"
}