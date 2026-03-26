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

def load_real_oslo_data():
    """Load real Oslo real estate data from JSON file"""
    try:
        with open('real_oslo_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data['apartments'], data['transactions']
    except FileNotFoundError:
        print("real_oslo_data.json not found, using fallback data")
        return [], []

def create_real_apartments(db: Session, apartments_data: List[Dict], transactions_data: List[Dict]):
    """Create apartments from real Oslo data"""
    
    # Clear existing data
    db.query(PropertyTransaction).delete()
    db.query(ApartmentTransaction).delete()
    db.commit()
    
    # Create apartments from real data
    for apt_data in apartments_data:
        # Check if apartment already exists
        existing = db.query(ApartmentTransaction).filter(
            ApartmentTransaction.address == apt_data["address"]
        ).first()
        
        if not existing:
            # Create apartment record
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
                property_type=apt_data["property_type"]
            )
            db.add(apartment)
            db.commit()
            db.refresh(apartment)
    
    # Create transaction history from real data
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
    print(f"✅ Loaded {len(apartments_data)} real Oslo apartments")
    print(f"✅ Loaded {len(transactions_data)} transaction records")

def create_sample_apartments_fallback(db: Session):
    """Fallback sample data if real data file not found"""
    
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
    
    # Clear existing data
    db.query(PropertyTransaction).delete()
    db.query(ApartmentTransaction).delete()
    db.commit()
    
    # Add more apartments to reach 25+
    districts = ["Frogner", "Grünerløkka", "Sentrum", "St Hanshaugen", "Tøyen", "Groruddal", "Nordstrand"]
    property_types = ["apartment", "house", "townhouse"]
    
    for i in range(4, 25):
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

def init_database():
    """Initialize database with real Oslo data or fallback"""
    db = SessionLocal()
    try:
        print("=== Initializing Oslo Real Estate Database ===")
        
        # Try to load real Oslo data
        apartments_data, transactions_data = load_real_oslo_data()
        
        if apartments_data:
            create_real_apartments(db, apartments_data, transactions_data)
        else:
            print("Using fallback sample data...")
            create_sample_apartments_fallback(db)
            
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
    return {"message": "Oslo Apartments API - Real Estate Data"}

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