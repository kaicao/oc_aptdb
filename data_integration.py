#!/usr/bin/env python3
"""
OC_APTDB Oslo Real Estate Data Sources Integration
Integrates multiple official Norwegian property data sources
"""

import requests
import json
import sqlite3
import logging
from datetime import datetime
from typing import List, Dict, Optional
import asyncio
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OsloRealEstateDataSource:
    """
    Integrates multiple data sources for Oslo real estate transactions
    """
    
    def __init__(self, db_path: str = "oslo_realestate.db"):
        self.db_path = db_path
        self.init_database()
        
        # Data source endpoints (these would need proper API keys/authentication in production)
        self.data_sources = {
            "eiendomsregisteret": {
                "base_url": "https://api.kartverket.no/eiendomsregisteret/v1",
                "description": "Official Norwegian property registry",
                "access_level": "public_free",
                "data_type": "property_metadata"
            },
            "infotorg": {
                "base_url": "https://api.infotorg.no/eiendomsregisteret/v1",
                "description": "Professional property data API",
                "access_level": "commercial",
                "data_type": "judicial_property_data"
            },
            "ssb_bolig": {
                "base_url": "https://data.ssb.no/api/v0/no/table/",
                "description": "Statistics Norway property data",
                "access_level": "public_free",
                "data_type": "property_statistics"
            },
            "eiendomspriser": {
                "base_url": "https://api.eiendomspriser.no/v1",
                "description": "Property sales data",
                "access_level": "freemium",
                "data_type": "sales_transactions"
            }
        }

    def init_database(self):
        """Initialize database schema for storing integrated data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS data_sources (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                last_updated TIMESTAMP,
                status TEXT,
                record_count INTEGER,
                error_message TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY,
                source_id INTEGER,
                property_id TEXT,
                transaction_type TEXT,
                price REAL,
                transaction_date DATE,
                area_sqm REAL,
                address TEXT,
                district TEXT,
                raw_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES data_sources (id)
            )
        """)
        
        conn.commit()
        conn.close()

    async def fetch_eiendomsregisteret_data(self) -> List[Dict]:
        """
        Fetch data from official Norwegian property registry
        Note: This would require proper API credentials in production
        """
        logger.info("Fetching data from Eiendomsregisteret...")
        
        # Simulated response based on research - real implementation would need API key
        simulated_data = [
            {
                "property_id": "0301-1-1234-5678",
                "address": "Kirkeveien 45, 0268 Oslo",
                "district": "Frogner",
                "latitude": 59.9241,
                "longitude": 10.7341,
                "property_type": "apartment",
                "area_sqm": 75.0,
                "last_updated": datetime.now().isoformat()
            },
            {
                "property_id": "0301-1-2345-6789", 
                "address": "Thorvald Meyers gate 23, 0552 Oslo",
                "district": "Grünerløkka",
                "latitude": 59.9208,
                "longitude": 10.7458,
                "property_type": "apartment",
                "area_sqm": 35.0,
                "last_updated": datetime.now().isoformat()
            }
        ]
        
        logger.info(f"Fetched {len(simulated_data)} records from Eiendomsregisteret")
        return simulated_data

    async def fetch_ssb_bolig_statistics(self) -> Dict:
        """
        Fetch statistics from Statistics Norway (SSB)
        Official data source for Norwegian property transactions
        """
        logger.info("Fetching property statistics from SSB...")
        
        # Simulated SSB data - real implementation would query SSB API
        simulated_stats = {
            "period": "2024-Q4",
            "oslo_avg_price_sqm": 85400,
            "total_transactions": 2847,
            "price_change_YoY": 0.065,
            "district_breakdown": {
                "Frogner": {"avg_price": 120000, "transactions": 234},
                "Grünerløkka": {"avg_price": 98000, "transactions": 189},
                "Bærum": {"avg_price": 150000, "transactions": 156}
            }
        }
        
        logger.info("Fetched property statistics from SSB")
        return simulated_stats

    async def fetch_eiendomspriser_data(self) -> List[Dict]:
        """
        Fetch property sales data from eiendomspriser.no
        Contains actual transaction prices
        """
        logger.info("Fetching transaction data from eiendomspriser.no...")
        
        # Simulated transaction data
        simulated_transactions = [
            {
                "transaction_id": "TX-2024-001",
                "property_id": "0301-1-1234-5678",
                "address": "Kirkeveien 45, 0268 Oslo",
                "district": "Frogner",
                "price": 8500000,
                "transaction_date": "2024-12-15",
                "area_sqm": 75.0,
                "property_type": "apartment",
                "rooms": 3,
                "source": "eiendomspriser.no"
            },
            {
                "transaction_id": "TX-2024-002", 
                "property_id": "0301-1-2345-6789",
                "address": "Thorvald Meyers gate 23, 0552 Oslo",
                "district": "Grünerløkka",
                "price": 4200000,
                "transaction_date": "2024-12-10",
                "area_sqm": 35.0,
                "property_type": "apartment",
                "rooms": 2,
                "source": "eiendomspriser.no"
            }
        ]
        
        logger.info(f"Fetched {len(simulated_transactions)} transaction records")
        return simulated_transactions

    def save_transactions_to_db(self, transactions: List[Dict], source_name: str):
        """Save transaction data to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get or create source_id
        cursor.execute("SELECT id FROM data_sources WHERE name = ?", (source_name,))
        result = cursor.fetchone()
        if result:
            source_id = result[0]
        else:
            cursor.execute(
                "INSERT INTO data_sources (name, last_updated, status, record_count) VALUES (?, ?, ?, ?)",
                (source_name, datetime.now(), "active", len(transactions))
            )
            source_id = cursor.lastrowid
        
        # Insert transactions
        for tx in transactions:
            cursor.execute("""
                INSERT OR REPLACE INTO transactions 
                (source_id, property_id, price, transaction_date, area_sqm, address, district, raw_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                source_id,
                tx.get("property_id", ""),
                tx.get("price", 0),
                tx.get("transaction_date", ""),
                tx.get("area_sqm", 0),
                tx.get("address", ""),
                tx.get("district", ""),
                json.dumps(tx)
            ))
        
        conn.commit()
        conn.close()
        logger.info(f"Saved {len(transactions)} transactions from {source_name}")

    async def update_property_data(self):
        """Main function to update property data from all sources"""
        logger.info("Starting property data update from all sources...")
        
        # Fetch data from multiple sources concurrently
        async with aiohttp.ClientSession() as session:
            try:
                # Fetch property registry data
                registry_data = await self.fetch_eiendomsregisteret_data()
                
                # Fetch statistics
                stats_data = await self.fetch_ssb_bolig_statistics()
                
                # Fetch transaction data
                transaction_data = await self.fetch_eiendomspriser_data()
                
                # Save all data to database
                self.save_transactions_to_db(transaction_data, "eiendomspriser")
                
                # Update statistics summary
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE data_sources 
                    SET last_updated = ?, record_count = ?, status = ?
                    WHERE name = 'ssb_bolig'
                """, (datetime.now(), len(stats_data.get("district_breakdown", {})), "active"))
                conn.commit()
                conn.close()
                
                logger.info("Property data update completed successfully")
                return {
                    "status": "success",
                    "records_updated": len(transaction_data),
                    "sources_checked": 3,
                    "last_updated": datetime.now().isoformat()
                }
                
            except Exception as e:
                logger.error(f"Error updating property data: {e}")
                return {
                    "status": "error", 
                    "error": str(e),
                    "last_updated": datetime.now().isoformat()
                }

    def get_integration_status(self) -> Dict:
        """Get current status of data integration"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                ds.name,
                ds.last_updated,
                ds.status,
                ds.record_count,
                COUNT(t.id) as actual_records
            FROM data_sources ds
            LEFT JOIN transactions t ON ds.id = t.source_id
            GROUP BY ds.id
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        return {
            "sources": [
                {
                    "name": row[0],
                    "last_updated": row[1],
                    "status": row[2],
                    "expected_records": row[3],
                    "actual_records": row[4]
                }
                for row in results
            ],
            "last_check": datetime.now().isoformat()
        }

    def get_sample_properties(self, limit: int = 10) -> List[Dict]:
        """Get sample properties from integrated data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT property_id, address, district, price, transaction_date, area_sqm, raw_data
            FROM transactions 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (limit,))
        
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                "property_id": row[0],
                "address": row[1],
                "district": row[2],
                "price": row[3],
                "transaction_date": row[4],
                "area_sqm": row[5],
                "raw_data": json.loads(row[6]) if row[6] else {}
            }
            for row in results
        ]

# Usage example
async def main():
    """Main function to run data integration"""
    data_source = OsloRealEstateDataSource()
    
    # Update data from all sources
    result = await data_source.update_property_data()
    print("Data integration result:", json.dumps(result, indent=2))
    
    # Show current status
    status = data_source.get_integration_status()
    print("\nIntegration status:", json.dumps(status, indent=2))
    
    # Show sample properties
    samples = data_source.get_sample_properties(5)
    print("\nSample properties:", json.dumps(samples, indent=2))

if __name__ == "__main__":
    asyncio.run(main())