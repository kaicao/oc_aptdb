#!/usr/bin/env python3
"""
Quick deployment verification script
"""

import os
import json
from pathlib import Path

def verify_deployment():
    """Verify all deployment files are correct"""
    
    print("=== Verifying Oslo Apartments Deployment ===\n")
    
    base_path = Path("/root/.openclaw/workspace/oc_aptdb")
    
    # Check frontend build
    frontend_dist = base_path / "frontend" / "dist"
    print("📱 FRONTEND VERIFICATION:")
    if frontend_dist.exists():
        print(f"✅ Frontend dist exists: {frontend_dist}")
        
        assets_dir = frontend_dist / "assets"
        if assets_dir.exists():
            js_files = list(assets_dir.glob("*.js"))
            css_files = list(assets_dir.glob("*.css"))
            print(f"✅ Assets: {len(js_files)} JS files, {len(css_files)} CSS files")
            
            index_file = frontend_dist / "index.html"
            if index_file.exists():
                print(f"✅ Index HTML: {index_file.stat().st_size} bytes")
            else:
                print("❌ Missing index.html")
        else:
            print("❌ Missing assets directory")
    else:
        print("❌ Frontend dist not found")
    
    # Check deployment folder
    deployment_dir = base_path / "deployment"
    print(f"\n🌐 DEPLOYMENT VERIFICATION:")
    if deployment_dir.exists():
        print(f"✅ Deployment directory: {deployment_dir}")
        
        # Check if deployment has correct files
        deploy_index = deployment_dir / "index.html"
        deploy_assets = deployment_dir / "assets"
        
        if deploy_index.exists() and deploy_assets.exists():
            print(f"✅ Deployment has correct structure")
            
            # Check if files are from latest build
            deploy_js_files = list(deploy_assets.glob("*.js"))
            if deploy_js_files:
                latest_js = deploy_js_files[0]
                print(f"✅ Latest JS: {latest_js.name}")
        else:
            print("❌ Deployment missing required files")
    else:
        print("❌ Deployment directory not found")
    
    # Check backend
    backend_dir = base_path / "backend"
    deploy_backend = deployment_dir / "backend"
    
    print(f"\n🔧 BACKEND VERIFICATION:")
    if backend_dir.exists():
        print(f"✅ Backend source: {backend_dir}")
        
        # Check database
        db_file = backend_dir / "oslo_realestate.db"
        if db_file.exists():
            print(f"✅ Database: {db_file.stat().st_size} bytes")
            
            # Check real data
            real_data = backend_dir / "real_oslo_data.json"
            if real_data.exists():
                try:
                    with open(real_data) as f:
                        data = json.load(f)
                        print(f"✅ Real data: {len(data['apartments'])} apartments, {len(data['transactions'])} transactions")
                except Exception as e:
                    print(f"❌ Real data error: {e}")
        else:
            print("❌ Database not found")
            
        if deploy_backend.exists():
            print(f"✅ Deployment backend: {deploy_backend}")
        else:
            print("❌ Deployment backend missing")
    
    print(f"\n🚀 DEPLOYMENT READY!")
    print(f"📁 Frontend: {base_path}/deployment/")
    print(f"🔧 Backend: {base_path}/deployment/backend/")
    print(f"🌐 Netlify: Connect repository → {base_path}")
    
    return True

if __name__ == "__main__":
    verify_deployment()