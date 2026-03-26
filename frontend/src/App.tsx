import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MapPin, Home, Search, Menu, User, Heart, Phone } from 'lucide-react'
import PropertyList from './components/PropertyList'
import PropertySearch from './components/PropertySearch'
import PropertyMap from './components/PropertyMap'
import PropertyDetail from './components/PropertyDetail'
import Header from './components/Header'

export interface Property {
  id: number
  title: string
  description?: string
  price: number
  bedrooms: number
  bathrooms: number
  area_sqm: number
  address: string
  district: string
  latitude?: number
  longitude?: number
  property_type: string
  status: string
  images?: string[]
  created_at: string
  updated_at: string
}

function App() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    district: '',
    propertyType: ''
  })
  const [showMap, setShowMap] = useState(true)

  // Load properties from backend
  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:8000/properties')
      const data = await response.json()
      setProperties(data)
      setFilteredProperties(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching properties:', error)
      setIsLoading(false)
    }
  }

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters)
    
    // Filter properties based on search criteria
    let filtered = [...properties]
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice))
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.bedrooms))
    }
    if (filters.district) {
      filtered = filtered.filter(p => 
        p.district.toLowerCase().includes(filters.district.toLowerCase())
      )
    }
    if (filters.propertyType) {
      filtered = filtered.filter(p => p.property_type === filters.propertyType)
    }
    
    setFilteredProperties(filtered)
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
  }

  const closePropertyDetail = () => {
    setSelectedProperty(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading Oslo properties...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find Your Perfect Home in Oslo
            </h1>
            <p className="text-gray-600 text-lg">
              Discover beautiful properties across Oslo's finest neighborhoods
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <PropertySearch onSearch={handleSearch} />
          </div>

          {/* Toggle Map/List View */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setShowMap(false)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  !showMap
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="inline w-4 h-4 mr-2" />
                List View
              </button>
              <button
                onClick={() => setShowMap(true)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showMap
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="inline w-4 h-4 mr-2" />
                Map View
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Properties List */}
            <div className={showMap ? 'hidden lg:block' : 'block'}>
              <div className="mb-4">
                <p className="text-gray-600">
                  {filteredProperties.length} properties found
                </p>
              </div>
              <PropertyList 
                properties={filteredProperties}
                onPropertyClick={handlePropertyClick}
              />
            </div>

            {/* Map */}
            {showMap && (
              <div className="lg:block">
                <PropertyMap 
                  properties={filteredProperties}
                  onPropertyClick={handlePropertyClick}
                />
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <Home className="w-8 h-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Districts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(properties.map(p => p.district)).size}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center">
                <Search className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.length > 0 
                      ? `₹${Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length / 1000000)}M`
                      : '₹0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Property Detail Modal */}
        {selectedProperty && (
          <PropertyDetail
            property={selectedProperty}
            onClose={closePropertyDetail}
          />
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2026 OC_APTDB - Oslo Real Estate Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App