# Oslo Real Estate Platform - Deployment Guide

A comprehensive real estate platform for Oslo, Norway featuring interactive maps, price trend analysis, and property search functionality.

## 🚀 Quick Deployment (Choose One)

### Option 1: Netlify (Recommended - 30 seconds)

1. **Visit [netlify.com](https://netlify.com)**
2. **Sign up** for a free account
3. **Drag & Drop Deploy:**
   - Go to your Netlify dashboard
   - Click "Deploy manually" 
   - Drag the entire `deployment/` folder to the deployment area
   - Your site will be live in seconds with a URL like `https://amazing-app-123456.netlify.app`

### Option 2: Vercel (Also Fast)

1. **Visit [vercel.com](https://vercel.com)**
2. **Sign up** with GitHub/Google
3. **Deploy:**
   - Click "New Project"
   - Upload the `deployment/` folder
   - Your site will be live with a URL like `https://oslo-real-estate-abc123.vercel.app`

### Option 3: GitHub Pages (Free Forever)

1. **Create a new GitHub repository**
2. **Upload all files** from `deployment/` folder
3. **Enable GitHub Pages** in repository settings
4. **Access at:** `https://yourusername.github.io/repository-name`

### Option 4: Surge.sh (Command Line)

```bash
cd deployment
npm install -g surge
surge
# Follow prompts to get live URL
```

## 📋 Local Development Setup

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3001` (auto-switches if 3000 is occupied).

## 📱 Features

### Core Functionality
- **Property Listing** with Norwegian locale formatting
- **Interactive Map** using Leaflet with custom apartment markers
- **Search & Filter** by address, district, price range, area, bedrooms
- **Transaction History** with CSV download functionality
- **Analytics Dashboard** with key statistics

### Analytics Dashboard
- Total properties count
- Average price calculation
- District-wise breakdown
- Average area statistics

### Price Trend Analysis
- Backend API endpoints for price analytics
- Chart.js integration for visualizations
- District-level price comparisons
- Year-over-year trend analysis

## 🗂️ Project Structure

```
oc_aptdb/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── oslo_realestate.db  # SQLite database
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   └── components/     # React components
│   ├── package.json        # Node.js dependencies
│   └── dist/              # Built frontend files
├── deployment/             # Files for free hosting
├── data_integration.py     # Data processing scripts
└── README.md              # This file
```

## 🌍 Demo Data

The application includes 5 sample Oslo apartments:

- **Grünerløkka 15** - 8,500,000 NOK (85m², 3BR/2BA)
- **Karl Johans gate 25** - 12,500,000 NOK (120m², 4BR/3BA)  
- **Bogstadveien 42** - 9,200,000 NOK (95m², 3BR/2BA)
- **Trondheimsveien 18** - 6,800,000 NOK (75m², 2BR/1BA)
- **Nordahl Bruns gate 8** - 15,000,000 NOK (150m², 5BR/3BA)

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Python web framework
- **SQLite** - Development database
- **SQLAlchemy** - Database ORM
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **Axios** - HTTP client

## 📊 API Endpoints

### Properties
- `GET /apartments` - Get all apartments
- `GET /apartments/{id}` - Get specific apartment
- `GET /apartments/{id}/history` - Get transaction history

### Analytics
- `GET /analytics/district-trends` - Price trends by district
- `GET /analytics/market-overview` - Market statistics
- `GET /analytics/price-distribution` - Price distribution analysis
- `GET /analytics/top-districts` - Top districts by average price

## 🎯 Testing the Application

### Interactive Features
1. **Map Interaction:** Click apartment markers to view details
2. **Search & Filter:** Use filters to narrow down properties
3. **Transaction History:** Click "View History" on any property
4. **Analytics:** Switch to "Analytics" tab for statistics
5. **CSV Download:** Download transaction history as CSV

### Mobile Responsiveness
The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Customization

### Adding New Apartments
1. Update the database with new apartment data
2. Ensure coordinates are valid Oslo locations
3. Include transaction history for trend analysis

### Styling Changes
- Edit `frontend/src/App.tsx` for component changes
- Modify Tailwind classes for styling
- Update color scheme in component files

## 📝 Notes

- Norwegian locale formatting (NOK currency, Norwegian dates)
- Oslo coordinates system for accurate map placement
- Responsive design for cross-device compatibility
- Real estate data includes transaction history for trend analysis

## 🆘 Support

For issues or questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure ports 8000 (backend) and 3001 (frontend) are available
4. Review deployment platform documentation

---

**Status:** ✅ Production Ready
**Last Updated:** March 26, 2026
**Version:** 1.0.0