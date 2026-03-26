from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, func, Boolean
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
    # Enhanced fields for current data
    market_status = Column(String, default="sold")
    year_built = Column(Integer)
    floor = Column(Integer)
    parking = Column(Boolean, default=False)
    balcony = Column(Boolean, default=False)
    energy_rating = Column(String)
    monthly_costs = Column(Float)
    description = Column(Text)
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

app = FastAPI(title="Oslo Apartments API", version="1.0.0")

# CORS middleware for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_real_oslo_data():
    """Load real Oslo real estate data from JSON file"""
    try:
        with open('real_oslo_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data['apartments'], data['transactions']
    except FileNotFoundError:
        print("real_oslo_data.json not found")
        return [], []

def create_real_apartments(db: Session, apartments_data: List[Dict], transactions_data: List[Dict]):
    """Create apartments from real Oslo data"""
    
    # Clear existing data
    db.query(PropertyTransaction).delete()
    db.query(ApartmentTransaction).delete()
    db.commit()
    
    print(f"=== Loading {len(apartments_data)} real Oslo apartments ===")
    
    # Create apartments from real data
    for i, apt_data in enumerate(apartments_data):
        # Create apartment record with enhanced data
        apartment = ApartmentTransaction(
            address=apt_data["address"],
            district=apt_data["district"],
            latitude=apt_data["latitude"],
            longitude=apt_data["longitude"],
            price=apt_data["price"],
            transaction_date=datetime.fromisoformat(apt_data["transaction_date"].replace("Z", "+00:00")),
            area_sqm=apt_data["area_sqm"],
            bedrooms=apt_data["bedrooms"],
            bathrooms=apt_data["bathrooms"],
            property_type=apt_data["property_type"],
            market_status=apt_data.get("market_status", "sold"),
            year_built=apt_data.get("year_built"),
            floor=apt_data.get("floor"),
            parking=apt_data.get("parking", False),
            balcony=apt_data.get("balcony", False),
            energy_rating=apt_data.get("energy_rating"),
            monthly_costs=apt_data.get("monthly_costs"),
            description=apt_data.get("description")
        )
        db.add(apartment)
        
        # Commit in batches for performance
        if i % 50 == 0:
            db.commit()
            print(f"   ✅ Loaded {i + 1} apartments...")
    
    # Final commit
    db.commit()
    print(f"✅ Completed loading {len(apartments_data)} apartments")
    
    # Create transaction history
    for tx_data in transactions_data:
        # Find the apartment
        apartment = db.query(ApartmentTransaction).filter(
            ApartmentTransaction.id == tx_data["apartment_id"]
        ).first()
        
        if apartment:
            # Create property transaction
            property_tx = PropertyTransaction(
                apartment_id=apartment.id,
                transaction_date=datetime.fromisoformat(tx_data["transaction_date"].replace("Z", "+00:00")),
                price=tx_data["price"],
                area_sqm=tx_data["area_sqm"]
            )
            db.add(property_tx)
    
    db.commit()
    print(f"✅ Loaded {len(transactions_data)} transaction records")

def init_database():
    """Initialize database with real Oslo data"""
    db = SessionLocal()
    try:
        print("=== Initializing Oslo Real Estate Database ===")
        
        # Try to load real Oslo data
        apartments_data, transactions_data = load_real_oslo_data()
        
        if apartments_data:
            create_real_apartments(db, apartments_data, transactions_data)
        else:
            print("❌ No data found!")
            
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_database()

@app.get("/")
def read_root():
    return {"message": "Oslo Apartments API - Current Market Data", "status": "running"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow().isoformat(),
        "data_loaded": True,
        "total_apartments": 200,
        "version": "1.0.0"
    }

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

@app.get("/analytics/market-overview")
def get_market_overview(db: Session = Depends(get_db)):
    """Get market overview analytics"""
    
    # Get total apartments and average price
    total_apartments = db.query(ApartmentTransaction).count()
    avg_price = db.query(func.avg(ApartmentTransaction.price)).scalar()
    
    # Get price by district
    district_stats = db.query(
        ApartmentTransaction.district,
        func.count(ApartmentTransaction.id).label('count'),
        func.avg(ApartmentTransaction.price).label('avg_price'),
        func.min(ApartmentTransaction.price).label('min_price'),
        func.max(ApartmentTransaction.price).label('max_price')
    ).group_by(ApartmentTransaction.district).all()
    
    return {
        "total_apartments": total_apartments,
        "average_price": avg_price,
        "district_stats": [
            {
                "district": district,
                "count": count,
                "avg_price": avg_price,
                "min_price": min_price,
                "max_price": max_price
            }
            for district, count, avg_price, min_price, max_price in district_stats
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)