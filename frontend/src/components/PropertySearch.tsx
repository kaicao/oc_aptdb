import React, { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface SearchFilters {
  minPrice: string
  maxPrice: string
  bedrooms: string
  district: string
  propertyType: string
}

interface PropertySearchProps {
  onSearch: (filters: SearchFilters) => void
}

const PropertySearch: React.FC<PropertySearchProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    district: '',
    propertyType: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleReset = () => {
    const resetFilters = {
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      district: '',
      propertyType: ''
    }
    setFilters(resetFilters)
    onSearch(resetFilters)
  }

  const osloDistricts = [
    'Frogner', 'Grünerløkka', 'Bærum', 'Nordstrand', 'Østensjø',
    'Gryland', 'Ullern', 'Sagene', 'Tøyen', 'Alna', 'Bygdøy-Frogner',
    'Sentrum', 'Vestre Aker', 'Nordre Aker', 'Grorud', 'Søndre Nordstrand'
  ]

  const propertyTypes = ['apartment', 'house', 'condo', 'townhouse', 'studio']

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by location or district..."
            className="input-field"
            value={filters.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-secondary flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button onClick={handleSearch} className="btn-primary flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
        <button
          onClick={() => {
            handleInputChange('bedrooms', '2')
            handleSearch()
          }}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          2+ Beds
        </button>
        <button
          onClick={() => {
            handleInputChange('propertyType', 'apartment')
            handleSearch()
          }}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Apartments
        </button>
        <button
          onClick={() => {
            handleInputChange('maxPrice', '6000000')
            handleSearch()
          }}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Under 6M
        </button>
        <button
          onClick={() => {
            handleInputChange('district', 'Frogner')
            handleSearch()
          }}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Frogner
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={handleReset}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Reset All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (₹)
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min price"
                  className="input-field text-sm"
                  value={filters.minPrice}
                  onChange={(e) => handleInputChange('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max price"
                  className="input-field text-sm"
                  value={filters.maxPrice}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Bedrooms
              </label>
              <select
                className="input-field text-sm"
                value={filters.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                className="input-field text-sm"
                value={filters.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
              >
                <option value="">Any Type</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                className="input-field text-sm"
                value={filters.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              >
                <option value="">Any District</option>
                {osloDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertySearch