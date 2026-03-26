#!/usr/bin/env python3
"""
Oslo Apartments Backend Deployment Script
Creates a deployment-ready backend package
"""

import os
import shutil
import zipfile
from pathlib import Path

def create_backend_deployment():
    """Create deployment package for backend"""
    
    print("=== Creating Backend Deployment Package ===")
    
    # Create deployment directory
    deploy_dir = Path("/root/.openclaw/workspace/oc_aptdb/deployment/backend")
    deploy_dir.mkdir(exist_ok=True)
    
    # Copy backend files
    backend_files = [
        "main.py",
        "requirements.txt", 
        "oslo_realestate.db",
        "real_oslo_data.json",
        "oslo_transactions.csv"
    ]
    
    for file in backend_files:
        src = Path(f"/root/.openclaw/workspace/oc_aptdb/backend/{file}")
        dst = deploy_dir / file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"✅ Copied {file}")
        else:
            print(f"⚠️  {file} not found")
    
    # Create deployment script
    deploy_script = '''#!/bin/bash
# Oslo Apartments Backend Deployment Script

echo "=== Deploying Oslo Apartments Backend ==="

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
echo "Starting Oslo Apartments API on port 8000..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
'''
    
    with open(deploy_dir / "deploy.sh", "w") as f:
        f.write(deploy_script)
    
    # Make executable
    os.chmod(deploy_dir / "deploy.sh", 0o755)
    
    # Create requirements.txt if not exists
    requirements = '''fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-multipart==0.0.6
'''
    
    with open(deploy_dir / "requirements.txt", "w") as f:
        f.write(requirements)
    
    print(f"✅ Backend deployment package created at {deploy_dir}")
    return deploy_dir

if __name__ == "__main__":
    create_backend_deployment()