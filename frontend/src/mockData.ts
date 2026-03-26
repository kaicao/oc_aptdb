// Mock data for Oslo apartments (fallback when API is unavailable)
// This ensures the website always shows data

export interface Apartment {
  id: number
  address: string
  district: string
  latitude: number
  longitude: number
  price: number
  transaction_date: string
  area_sqm: number
  bedrooms: number
  bathrooms: number
  property_type: string
  market_status: string
  year_built: number
  floor?: number
  parking: boolean
  balcony: boolean
  energy_rating: string
  monthly_costs: number
  description: string
  created_at: string
}

export const MOCK_OSLO_APARTMENTS: Apartment[] = [
  {
    id: 1,
    address: "Kirkeveien 45, 0268 Oslo",
    district: "Frogner",
    latitude: 59.9241,
    longitude: 10.7341,
    price: 12850000,
    transaction_date: "2025-02-15T00:00:00",
    area_sqm: 85,
    bedrooms: 3,
    bathrooms: 2,
    property_type: "apartment",
    market_status: "for_sale",
    year_built: 2018,
    floor: 4,
    parking: true,
    balcony: true,
    energy_rating: "B",
    monthly_costs: 4500,
    description: "Beautiful modern apartment in prestigious Frogner district with city views.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 2,
    address: "Thorvald Meyers gate 23, 0552 Oslo",
    district: "Grünerløkka",
    latitude: 59.9208,
    longitude: 10.7458,
    price: 8750000,
    transaction_date: "2025-01-20T00:00:00",
    area_sqm: 65,
    bedrooms: 2,
    bathrooms: 1,
    property_type: "apartment",
    market_status: "sold",
    year_built: 2005,
    floor: 2,
    parking: false,
    balcony: true,
    energy_rating: "C",
    monthly_costs: 3200,
    description: "Charming apartment on popular Grünerløkka street with restaurants and cafes nearby.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 3,
    address: "Karl Johans gate 1, 0154 Oslo",
    district: "Sentrum",
    latitude: 59.9139,
    longitude: 10.7522,
    price: 22500000,
    transaction_date: "2025-03-10T00:00:00",
    area_sqm: 120,
    bedrooms: 4,
    bathrooms: 3,
    property_type: "apartment",
    market_status: "for_sale",
    year_built: 2020,
    floor: 8,
    parking: true,
    balcony: true,
    energy_rating: "A",
    monthly_costs: 6800,
    description: "Luxury apartment in the heart of Oslo with panoramic city views.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 4,
    address: "St Hanshaugen 8, 0175 Oslo",
    district: "St Hanshaugen",
    latitude: 59.9381,
    longitude: 10.7204,
    price: 6200000,
    transaction_date: "2024-12-05T00:00:00",
    area_sqm: 70,
    bedrooms: 2,
    bathrooms: 1,
    property_type: "apartment",
    market_status: "sold",
    year_built: 1995,
    floor: 1,
    parking: false,
    balcony: false,
    energy_rating: "D",
    monthly_costs: 2800,
    description: "Cozy apartment near St Hanshaugen park with peaceful surroundings.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 5,
    address: "Bygdøy Allé 86, 0154 Oslo",
    district: "Ullern",
    latitude: 59.9250,
    longitude: 10.7000,
    price: 18200000,
    transaction_date: "2025-02-28T00:00:00",
    area_sqm: 110,
    bedrooms: 3,
    bathrooms: 2,
    property_type: "apartment",
    market_status: "for_sale",
    year_built: 2015,
    floor: 5,
    parking: true,
    balcony: true,
    energy_rating: "A",
    monthly_costs: 5500,
    description: "Modern apartment with waterfront views and premium finishes.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 6,
    address: "Bjølsens gate 105, 0152 Oslo",
    district: "Bjerke",
    latitude: 59.9500,
    longitude: 10.7500,
    price: 4950000,
    transaction_date: "2024-11-15T00:00:00",
    area_sqm: 55,
    bedrooms: 1,
    bathrooms: 1,
    property_type: "apartment",
    market_status: "sold",
    year_built: 1988,
    floor: 3,
    parking: false,
    balcony: true,
    energy_rating: "C",
    monthly_costs: 2500,
    description: "Compact studio apartment perfect for young professionals.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 7,
    address: "Kirkegata 46, 0104 Oslo",
    district: "Grünerløkka",
    latitude: 59.9180,
    longitude: 10.7480,
    price: 9100000,
    transaction_date: "2025-01-10T00:00:00",
    area_sqm: 75,
    bedrooms: 2,
    bathrooms: 1,
    property_type: "apartment",
    market_status: "sold",
    year_built: 2008,
    floor: 3,
    parking: false,
    balcony: true,
    energy_rating: "B",
    monthly_costs: 3500,
    description: "Trendy apartment in the heart of Oslo's cultural scene.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 8,
    address: "Prinsens gate 88, 0151 Oslo",
    district: "Nordre Aker",
    latitude: 59.8690,
    longitude: 10.7260,
    price: 8258000,
    transaction_date: "2025-03-05T00:00:00",
    area_sqm: 78,
    bedrooms: 3,
    bathrooms: 1,
    property_type: "apartment",
    market_status: "for_sale",
    year_built: 2010,
    floor: 2,
    parking: true,
    balcony: false,
    energy_rating: "B",
    monthly_costs: 3800,
    description: "Spacious family apartment in quiet residential area.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 9,
    address: "Briskebyveien 131, 0105 Oslo",
    district: "Gryland",
    latitude: 59.9530,
    longitude: 10.7830,
    price: 4395000,
    transaction_date: "2024-10-20T00:00:00",
    area_sqm: 208,
    bedrooms: 6,
    bathrooms: 2,
    property_type: "house",
    market_status: "sold",
    year_built: 1985,
    floor: undefined,
    parking: true,
    balcony: true,
    energy_rating: "D",
    monthly_costs: 4200,
    description: "Large family house with garden in peaceful neighborhood.",
    created_at: "2025-03-26T18:00:00.000Z"
  },
  {
    id: 10,
    address: "Borgundsdalsveien 115, 0152 Oslo",
    district: "Bjerke",
    latitude: 59.9000,
    longitude: 10.8210,
    price: 10173000,
    transaction_date: "2025-03-09T00:00:00",
    area_sqm: 73,
    bedrooms: 1,
    bathrooms: 1,
    property_type: "apartment",
    market_status: "for_sale",
    year_built: 2019,
    floor: 6,
    parking: false,
    balcony: true,
    energy_rating: "A",
    monthly_costs: 3100,
    description: "Modern apartment with excellent public transport connections.",
    created_at: "2025-03-26T18:00:00.000Z"
  }
]

// Generate additional apartments to reach 25+
export const generateAdditionalApartments = (): Apartment[] => {
  const districts = [
    "Frogner", "Grünerløkka", "Sentrum", "St Hanshaugen", "Tøyen", 
    "Gryland", "Nordstrand", "Ullern", "Sagene", "Bjerke",
    "Nordre Aker", "Søndre Aker", "Østensjø", "Alna", "Groruddal"
  ]
  
  const streets = [
    "Kirkeveien", "Thorvald Meyers gate", "Karl Johans gate", "Prinsens gate",
    "Briskebyveien", "Bygdøy Allé", "Olav Vs gate", "Universitetsgata",
    "Akershusveien", "Kirkegata", "Grensen", "Dronningens gate",
    "Kongens gate", "Møllergata", "Storgata"
  ]
  
  const priceRanges: Record<string, [number, number]> = {
    "Sentrum": [15000000, 35000000],
    "Frogner": [8000000, 25000000],
    "Grünerløkka": [4000000, 12000000],
    "Ullern": [12000000, 28000000],
    "St Hanshaugen": [6000000, 18000000],
    "Tøyen": [2000000, 8000000],
    "Nordstrand": [3000000, 15000000],
    "Bjerke": [4000000, 14000000],
    "Sagene": [5000000, 16000000]
  }
  
  const additional: Apartment[] = []
  
  for (let i = 11; i <= 25; i++) {
    const district = districts[i % districts.length]
    const [minPrice, maxPrice] = priceRanges[district] || [2500000, 12000000]
    const price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice)
    const area = Math.floor(Math.random() * 151 + 25) // 25-175 m², realistic apartment sizes
    
    additional.push({
      id: i,
      address: `${streets[i % streets.length]} ${Math.floor(Math.random() * 150 + 1)}, 0${Math.floor(Math.random() * 100 + 150)} Oslo`,
      district,
      latitude: 59.9139 + (Math.random() - 0.5) * 0.16, // Oslo ± 8km
      longitude: 10.7522 + (Math.random() - 0.5) * 0.20,
      price,
      transaction_date: `2025-0${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 28) + 1}T00:00:00`,
      area_sqm: area,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 2) + 1,
      property_type: Math.random() > 0.7 ? "house" : "apartment",
      market_status: Math.random() > 0.5 ? "for_sale" : "sold",
      year_built: Math.floor(Math.random() * 25) + 1999,
      floor: Math.random() > 0.3 ? Math.floor(Math.random() * 8) + 1 : undefined,
      parking: Math.random() > 0.6,
      balcony: Math.random() > 0.4,
      energy_rating: ["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)],
      monthly_costs: Math.floor(Math.random() * 6000) + 2000,
      description: `Beautiful ${area}m² ${Math.random() > 0.7 ? "house" : "apartment"} in ${district} district.`,
      created_at: "2025-03-26T18:00:00.000Z"
    })
  }
  
  return additional
}

export const ALL_OSLO_APARTMENTS: Apartment[] = [
  ...MOCK_OSLO_APARTMENTS,
  ...generateAdditionalApartments()
]

// API helper with fallback
export const fetchApartments = async (params: string = ""): Promise<any> => {
  try {
    // Try to fetch from API first
    const response = await fetch(`https://oslo-apartments-api.netlify.app/apartments?${params}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.warn("API unavailable, using mock data:", error)
    
    // Fallback to mock data
    const apartments = ALL_OSLO_APARTMENTS
    const searchParams = new URLSearchParams(params)
    
    // Apply basic filtering to mock data
    let filteredApartments = [...apartments]
    
    if (searchParams.has("address")) {
      const addressSearch = searchParams.get("address")?.toLowerCase() || ""
      filteredApartments = filteredApartments.filter(apt => 
        apt.address.toLowerCase().includes(addressSearch)
      )
    }
    
    if (searchParams.has("district")) {
      const districtFilter = searchParams.get("district") || ""
      filteredApartments = filteredApartments.filter(apt => apt.district === districtFilter)
    }
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return {
      apartments: filteredApartments.slice(startIndex, endIndex),
      total: filteredApartments.length,
      page,
      limit,
      pages: Math.ceil(filteredApartments.length / limit),
      mock_data: true,
      message: "Using mock data - API unavailable"
    }
  }
}

export const fetchApartmentHistory = async (id: number): Promise<any> => {
  try {
    // Try to fetch from API first
    const response = await fetch(`https://oslo-apartments-api.netlify.app/apartments/${id}/history`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.warn("API history unavailable, using mock data:", error)
    
    // Fallback to mock data
    const apartment = ALL_OSLO_APARTMENTS.find(apt => apt.id === id)
    if (!apartment) {
      throw new Error("Apartment not found")
    }
    
    // Generate mock transaction history
    const transactions = []
    const basePrice = apartment.price
    for (let i = 0; i < 3; i++) {
      const price = Math.floor(basePrice * (0.8 + Math.random() * 0.4))
      const daysAgo = (i + 1) * 365
      const date = new Date(apartment.transaction_date)
      date.setDate(date.getDate() - daysAgo)
      
      transactions.push({
        id: i + 1,
        price,
        transaction_date: date.toISOString(),
        area_sqm: Math.round(apartment.area_sqm + (Math.random() - 0.5) * 4) // Realistic ±2 m² variation, rounded to whole number
      })
    }
    
    return {
      apartment_id: id,
      apartment_address: apartment.address,
      transactions,
      mock_data: true,
      message: "Using mock data - API unavailable"
    }
  }
}

export const fetchDistricts = async (): Promise<any> => {
  try {
    const response = await fetch("https://oslo-apartments-api.netlify.app/districts")
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.warn("API districts unavailable, using mock data:", error)
    
    // Fallback to mock districts
    const districts = [...new Set(ALL_OSLO_APARTMENTS.map(apt => apt.district))]
    return { districts, mock_data: true }
  }
}