from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional
import os
import uvicorn

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./oslo_realestate.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI app setup
app = FastAPI(
    title="OC_APTDB Oslo Real Estate API",
    description="Real estate API for Oslo properties",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    area_sqm = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    district = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    property_type = Column(String, nullable=False)  # apartment, house, etc.
    status = Column(String, default="available")  # available, sold, rented
    images = Column(Text, nullable=True)  # JSON string of image URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models
class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    bedrooms: int
    bathrooms: int
    area_sqm: float
    address: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    property_type: str
    status: str = "available"
    images: Optional[List[str]] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyResponse(PropertyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Security
security = HTTPBearer()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper function to verify JWT token (simplified for demo)
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, implement proper JWT validation
    if not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    return credentials.credentials

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)
    
    # Add sample data
    db = SessionLocal()
    try:
        if db.query(Property).count() == 0:
            sample_properties = [
                Property(
                    title="Modern Apartment in Frogner",
                    description="Beautiful modern 2-bedroom apartment in the prestigious Frogner district. Recently renovated with high-end finishes.",
                    price=8500000,
                    bedrooms=2,
                    bathrooms=1,
                    area_sqm=75,
                    address="Kirkeveien 45, 0268 Oslo",
                    district="Frogner",
                    latitude=59.9241,
                    longitude=10.7341,
                    property_type="apartment",
                    images='["https://example.com/img1.jpg", "https://example.com/img2.jpg"]'
                ),
                Property(
                    title="Spacious Family House in Bærum",
                    description="Large family home with garden and garage in Bærum municipality. Perfect for families.",
                    price=12000000,
                    bedrooms=4,
                    bathrooms=2,
                    area_sqm=180,
                    address="Søndre Løken 12, 1364 Bærum",
                    district="Bærum",
                    latitude=59.8809,
                    longitude=10.4964,
                    property_type="house",
                    status="available"
                ),
                Property(
                    title="Studio in Grünerløkka",
                    description="Cozy studio apartment in trendy Grünerløkka district. Perfect for young professionals.",
                    price=4200000,
                    bedrooms=1,
                    bathrooms=1,
                    area_sqm=35,
                    address="Thorvald Meyers gate 23, 0552 Oslo",
                    district="Grünerløkka",
                    latitude=59.9208,
                    longitude=10.7458,
                    property_type="apartment",
                    status="available"
                )
            ]
            
            db.add_all(sample_properties)
            db.commit()
    finally:
        db.close()

# Routes
@app.get("/")
async def root():
    return {"message": "OC_APTDB Oslo Real Estate API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Property endpoints
@app.get("/properties", response_model=List[PropertyResponse])
async def get_properties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    properties = db.query(Property).offset(skip).limit(limit).all()
    
    # Convert images JSON string to list
    for prop in properties:
        if prop.images:
            try:
                import json
                prop.images = json.loads(prop.images)
            except:
                prop.images = []
        else:
            prop.images = []
    
    return properties

@app.get("/properties/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int, db: Session = Depends(get_db)):
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Convert images JSON string to list
    if property_obj.images:
        try:
            import json
            property_obj.images = json.loads(property_obj.images)
        except:
            property_obj.images = []
    else:
        property_obj.images = []
    
    return property_obj

@app.post("/properties", response_model=PropertyResponse)
async def create_property(property: PropertyCreate, db: Session = Depends(get_db)):
    # Convert images list to JSON string
    images_json = None
    if property.images:
        import json
        images_json = json.dumps(property.images)
    
    db_property = Property(
        **property.dict(),
        images=images_json
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@app.put("/properties/{property_id}", response_model=PropertyResponse)
async def update_property(property_id: int, property_update: PropertyBase, db: Session = Depends(get_db)):
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    for key, value in property_update.dict().items():
        setattr(db_property, key, value)
    
    db.commit()
    db.refresh(db_property)
    return db_property

@app.delete("/properties/{property_id}")
async def delete_property(property_id: int, db: Session = Depends(get_db)):
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(db_property)
    db.commit()
    return {"message": "Property deleted successfully"}

# Search endpoint
@app.get("/properties/search", response_model=List[PropertyResponse])
async def search_properties(
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    district: Optional[str] = None,
    property_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    
    if min_price:
        query = query.filter(Property.price >= min_price)
    if max_price:
        query = query.filter(Property.price <= max_price)
    if bedrooms:
        query = query.filter(Property.bedrooms >= bedrooms)
    if district:
        query = query.filter(Property.district.contains(district))
    if property_type:
        query = query.filter(Property.property_type == property_type)
    
    properties = query.all()
    
    # Convert images JSON string to list
    for prop in properties:
        if prop.images:
            try:
                import json
                prop.images = json.loads(prop.images)
            except:
                prop.images = []
        else:
            prop.images = []
    
    return properties

# User endpoints (basic authentication)
@app.post("/users/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # For demo purposes, store password as-is (in production, hash it)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=user.password  # In production: hash the password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Statistics endpoint
@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    total_properties = db.query(Property).count()
    available_properties = db.query(Property).filter(Property.status == "available").count()
    average_price = db.query(Property.price).all()
    
    if average_price:
        avg_price = sum([p[0] for p in average_price]) / len(average_price)
    else:
        avg_price = 0
    
    return {
        "total_properties": total_properties,
        "available_properties": available_properties,
        "average_price": avg_price
    }

if __name__ == "__main__":
    # Create tables and add sample data
    create_tables()
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8000)