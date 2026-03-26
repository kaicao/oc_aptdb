from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import json
import os

# Database setup
DATABASE_URL = "sqlite:///./oslo_realestate.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ApartmentTransaction(Base):
    __tablename__ = "apartment_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, index=True)
    district = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    price = Column(Float)
    transaction_date = Column(DateTime)
    area_sqm = Column(Float)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    property_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class PropertyTransaction(Base):
    __tablename__ = "property_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    apartment_id = Column(Integer, index=True)
    transaction_date = Column(DateTime)
    price = Column(Float)
    area_sqm = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="Oslo Apartments API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_sample_apartments(db: Session):
    """Create sample apartment data with transaction history"""
    
    # Sample apartments in Oslo
    apartments_data = [
        {
            "address": "Kirkeveien 45, 0268 Oslo",
            "district": "Frogner",
            "latitude": 59.9241,
            "longitude": 10.7341,
            "area_sqm": 75.0,
            "bedrooms": 2,
            "bathrooms": 1,
            "property_type": "apartment"
        },
        {
            "address": "Thorvald Meyers gate 23, 0552 Oslo", 
            "district": "Grünerløkka",
            "latitude": 59.9208,
            "longitude": 10.7458,
            "area_sqm": 35.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "property_type": "apartment"
        },
        {
            "address": "Karl Johans gate 1, 0154 Oslo",
            "district": "Sentrum", 
            "latitude": 59.9139,
            "longitude": 10.7522,
            "area_sqm": 120.0,
            "bedrooms": 3,
            "bathrooms": 2,
            "property_type": "apartment"
        },
        {
            "address": "Grünerløkka 15, 0552 Oslo",
            "district": "Grünerløkka",
            "latitude": 59.9215,
            "longitude": 10.7505,
            "area_sqm": 50.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "property_type": "apartment"
        },
        {
            "address": "St Hanshaugen 8, 0175 Oslo",
            "district": "St Hanshaugen",
            "latitude": 59.9381,
            "longitude": 10.7204,
            "area_sqm": 85.0,
            "bedrooms": 2,
            "bathrooms": 1,
            "property_type": "apartment"
        }
    ]
    
    # Add more apartments to reach 25+
    districts = ["Frogner", "Grünerløkka", "Sentrum", "St Hanshaugen", "Tøyen", "Gryland", "Nordstrand"]
    property_types = ["apartment", "house", "townhouse"]
    
    for i in range(5, 25):
        apartment = {
            "address": f"{districts[i % len(districts)]} {random.randint(10, 99)}, {random.randint(1, 99)}{random.choice(['A', 'B', 'C'])} Oslo",
            "district": districts[i % len(districts)],
            "latitude": 59.9139 + random.uniform(-0.05, 0.05),
            "longitude": 10.7522 + random.uniform(-0.05, 0.05),
            "area_sqm": random.randint(25, 150),
            "bedrooms": random.randint(1, 4),
            "bathrooms": random.randint(1, 2),
            "property_type": property_types[random.randint(0, len(property_types) - 1)]
        }
        apartments_data.append(apartment)
    
    # Create transactions for each apartment
    for apartment_data in apartments_data:
        # Check if apartment already exists
        existing = db.query(ApartmentTransaction).filter(
            ApartmentTransaction.address == apartment_data["address"]
        ).first()
        
        if not existing:
            # Create apartment record
            price = apartment_data["area_sqm"] * random.randint(80000, 150000)
            transaction_date = datetime.now() - timedelta(days=random.randint(30, 365))
            
            apartment = ApartmentTransaction(
                address=apartment_data["address"],
                district=apartment_data["district"],
                latitude=apartment_data["latitude"],
                longitude=apartment_data["longitude"],
                price=price,
                transaction_date=transaction_date,
                area_sqm=apartment_data["area_sqm"],
                bedrooms=apartment_data["bedrooms"],
                bathrooms=apartment_data["bathrooms"],
                property_type=apartment_data["property_type"]
            )
            db.add(apartment)
            db.commit()
            db.refresh(apartment)
            
            # Create transaction history (1-4 transactions per apartment)
            num_transactions = random.randint(1, 4)
            for j in range(num_transactions):
                # Each subsequent transaction gets a slightly different price
                price_variation = random.uniform(0.8, 1.2)
                history_price = price * price_variation
                history_date = transaction_date + timedelta(days=random.randint(30, 365))
                
                property_tx = PropertyTransaction(
                    apartment_id=apartment.id,
                    transaction_date=history_date,
                    price=history_price,
                    area_sqm=apartment_data["area_sqm"] * random.uniform(0.95, 1.05)
                )
                db.add(property_tx)
            
            db.commit()

def init_sample_data():
    """Initialize database with sample data"""
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(PropertyTransaction).delete()
        db.query(ApartmentTransaction).delete()
        db.commit()
        
        # Create new sample data
        create_sample_apartments(db)
        print("Sample apartment data created successfully")
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

# Initialize sample data on startup
@app.on_event("startup")
def startup_event():
    init_sample_data()

@app.get("/")
def read_root():
    return {"message": "Oslo Apartments API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/apartments")
def get_apartments(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    address: Optional[str] = None,
    district: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get apartments with pagination and filters"""
    
    query = db.query(ApartmentTransaction)
    
    # Apply filters
    if address:
        query = query.filter(ApartmentTransaction.address.contains(address))
    if district:
        query = query.filter(ApartmentTransaction.district == district)
    if start_date:
        query = query.filter(ApartmentTransaction.transaction_date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(ApartmentTransaction.transaction_date <= datetime.fromisoformat(end_date))
    
    # Get total count for pagination
    total = query.count()
    
    # Get paginated results
    apartments = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "apartments": apartments,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@app.get("/apartments/{apartment_id}/history")
def get_apartment_history(apartment_id: int, db: Session = Depends(get_db)):
    """Get transaction history for a specific apartment"""
    
    # Verify apartment exists
    apartment = db.query(ApartmentTransaction).filter(ApartmentTransaction.id == apartment_id).first()
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartment not found")
    
    # Get transaction history
    transactions = db.query(PropertyTransaction).filter(
        PropertyTransaction.apartment_id == apartment_id
    ).order_by(PropertyTransaction.transaction_date.desc()).all()
    
    return {
        "apartment_id": apartment_id,
        "apartment_address": apartment.address,
        "transactions": transactions
    }

@app.get("/districts")
def get_districts(db: Session = Depends(get_db)):
    """Get list of available districts"""
    districts = db.query(ApartmentTransaction.district).distinct().all()
    return {"districts": [d[0] for d in districts]}

@app.get("/analytics/district-trends")
def get_district_trends(db: Session = Depends(get_db)):
    """Get price trends by district"""
    
    # Get all districts and their average prices by year
    districts = db.query(
        ApartmentTransaction.district,
        func.strftime('%Y', ApartmentTransaction.transaction_date).label('year'),
        func.avg(ApartmentTransaction.price).label('avg_price'),
        func.count(ApartmentTransaction.id).label('transaction_count')
    ).group_by(
        ApartmentTransaction.district,
        func.strftime('%Y', ApartmentTransaction.transaction_date)
    ).all()
    
    # Format the data
    district_data = {}
    for district, year, avg_price, count in districts:
        if district not in district_data:
            district_data[district] = {}
        district_data[district][year] = {
            "avg_price": round(avg_price, 2),
            "transaction_count": count
        }
    
    return {
        "district_trends": district_data,
        "generated_at": datetime.utcnow().isoformat()
    }

@app.get("/analytics/market-overview")
def get_market_overview(db: Session = Depends(get_db)):
    """Get market overview statistics"""
    
    # Current year stats
    current_year = datetime.now().year
    year_start = datetime(current_year, 1, 1)
    
    # Current year transactions
    current_year_data = db.query(
        func.avg(ApartmentTransaction.price).label('avg_price'),
        func.count(ApartmentTransaction.id).label('total_transactions'),
        func.min(ApartmentTransaction.price).label('min_price'),
        func.max(ApartmentTransaction.price).label('max_price'),
        func.avg(ApartmentTransaction.area_sqm).label('avg_area')
    ).filter(ApartmentTransaction.transaction_date >= year_start).first()
    
    # Previous year for comparison
    prev_year = current_year - 1
    prev_year_start = datetime(prev_year, 1, 1)
    prev_year_end = datetime(current_year - 1, 12, 31)
    
    prev_year_data = db.query(
        func.avg(ApartmentTransaction.price).label('avg_price')
    ).filter(
        ApartmentTransaction.transaction_date >= prev_year_start,
        ApartmentTransaction.transaction_date <= prev_year_end
    ).first()
    
    # Calculate price change
    current_avg = current_year_data.avg_price or 0
    prev_avg = prev_year_data.avg_price or 0
    price_change = ((current_avg - prev_avg) / prev_avg * 100) if prev_avg > 0 else 0
    
    return {
        "current_year": current_year,
        "current_year_stats": {
            "avg_price": round(current_avg, 2),
            "total_transactions": current_year_data.total_transactions or 0,
            "min_price": current_year_data.min_price or 0,
            "max_price": current_year_data.max_price or 0,
            "avg_area": round(current_year_data.avg_area, 2)
        },
        "previous_year": prev_year,
        "year_over_year_change": round(price_change, 2),
        "generated_at": datetime.utcnow().isoformat()
    }

@app.get("/analytics/price-distribution")
def get_price_distribution(
    district: Optional[str] = None,
    property_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get price distribution analysis"""
    
    query = db.query(ApartmentTransaction.price, ApartmentTransaction.district, ApartmentTransaction.property_type, ApartmentTransaction.area_sqm)
    
    if district:
        query = query.filter(ApartmentTransaction.district == district)
    if property_type:
        query = query.filter(ApartmentTransaction.property_type == property_type)
    
    results = query.all()
    
    if not results:
        return {"error": "No data found for the specified criteria"}
    
    # Calculate statistics
    prices = [r[0] for r in results]
    districts = [r[1] for r in results]
    property_types = [r[2] for r in results]
    
    stats = {
        "count": len(prices),
        "min_price": min(prices),
        "max_price": max(prices),
        "avg_price": sum(prices) / len(prices),
        "median_price": sorted(prices)[len(prices) // 2],
        "districts": list(set(districts)),
        "property_types": list(set(property_types))
    }
    
    # Create price ranges
    price_ranges = {
        "under_1m": len([p for p in prices if p < 1000000]),
        "1m_to_2m": len([p for p in prices if 1000000 <= p < 2000000]),
        "2m_to_3m": len([p for p in prices if 2000000 <= p < 3000000]),
        "3m_to_5m": len([p for p in prices if 3000000 <= p < 5000000]),
        "over_5m": len([p for p in prices if p >= 5000000])
    }
    
    return {
        "statistics": stats,
        "price_ranges": price_ranges,
        "generated_at": datetime.utcnow().isoformat()
    }

@app.get("/analytics/top-districts")
def get_top_districts(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Get top districts by average price"""
    
    results = db.query(
        ApartmentTransaction.district,
        func.avg(ApartmentTransaction.price).label('avg_price'),
        func.count(ApartmentTransaction.id).label('transaction_count'),
        func.avg(ApartmentTransaction.area_sqm).label('avg_area')
    ).group_by(ApartmentTransaction.district).order_by(
        func.avg(ApartmentTransaction.price).desc()
    ).limit(limit).all()
    
    districts_data = []
    for district, avg_price, count, avg_area in results:
        districts_data.append({
            "district": district,
            "avg_price": round(avg_price, 2),
            "transaction_count": count,
            "avg_area": round(avg_area, 2),
            "price_per_sqm": round(avg_price / avg_area, 2) if avg_area > 0 else 0
        })
    
    return {
        "top_districts": districts_data,
        "generated_at": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)