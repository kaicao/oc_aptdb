# 🚀 Quick Pipeline Setup Guide

## 🎯 **What This Pipeline Does**

Automatically updates the `deployment/` folder whenever code changes, so you **never have to manually regenerate deployment files again**.

## 🔧 **Required GitHub Secrets**

To enable full automation, add these secrets to your GitHub repository:

### **For Netlify Deployment:**
1. Go to repository → Settings → Secrets and variables → Actions
2. Add these secrets:

```bash
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
```

**How to get these:**
- **NETLIFY_AUTH_TOKEN**: Go to Netlify → Account Settings → Personal access tokens → Generate new token
- **NETLIFY_SITE_ID**: Go to Site Settings → General → Site details → Copy "Site ID"

## ✅ **Current Status**

**Pipeline Created**: ✅
- `.github/workflows/auto-update.yml` - Main automation
- `.github/workflows/deploy-netlify.yml` - Netlify deployment  
- `.github/PIPELINE_DOCS.md` - Full documentation

**Without GitHub Secrets**: ⚠️
- Auto-update still works (updates deployment folder)
- Netlify deployment requires secrets
- You can manually deploy the updated deployment folder

## 🧪 **Test the Pipeline**

**Trigger pipeline** by making any code change:
```bash
# Example changes that trigger pipeline:
- Edit any frontend file (components, styles)
- Update backend code (API, database)
- Modify data generation scripts
- Change configuration files
```

**What happens:**
1. Pipeline builds frontend
2. Regenerates Oslo data  
3. Updates deployment folder
4. Commits changes with detailed message
5. Pushes to GitHub (triggers Netlify if configured)

## 📊 **Monitor Pipeline**

**Check pipeline status**:
- GitHub Repository → Actions tab
- Shows real-time build progress
- Detailed logs for each step
- Success/failure notifications

## 🎉 **Benefits**

✅ **No more manual deployment updates**
✅ **Always latest code in deployment folder**
✅ **Real Oslo data auto-regenerated**
✅ **Automatic build verification**
✅ **Detailed commit messages explain changes**

## 🔍 **Manual Verification**

After pipeline runs:
```bash
# Check what was updated:
git log --oneline -n 5

# See deployment folder changes:
git diff HEAD~1 deployment/

# Download deployment folder:
# Download ZIP from GitHub → deployment/ folder
```

---

**🧠 Key Point**: Once set up, the pipeline handles deployment folder updates automatically. Focus on coding - deployment happens by itself!