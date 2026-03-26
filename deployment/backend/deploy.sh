#!/bin/bash
# Oslo Apartments Backend Deployment Script

echo "=== Deploying Oslo Apartments Backend ==="

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
echo "Starting Oslo Apartments API on port 8000..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
