import React from 'react'
import { MapPin, Bed, Bath, Square, Heart, Share, Home } from 'lucide-react'
import type { Property } from '../App'

interface PropertyListProps {
  properties: Property[]
  onPropertyClick: (property: Property) => void
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onPropertyClick }) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₹${(price / 1000000).toFixed(1)}M`
    }
    return `₹${(price / 1000).toFixed(0)}K`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-red-100 text-red-800'
      case 'rented':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search criteria to find more properties.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {properties.map((property) => (
        <div 
          key={property.id}
          className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          onClick={() => onPropertyClick(property)}
        >
          <div className="md:flex">
            {/* Property Image */}
            <div className="md:w-1/3">
              <div className="h-48 md:h-full bg-gradient-to-r from-primary-400 to-secondary-400 relative">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <Home className="w-16 h-16" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                    <Heart className="w-4 h-4 text-gray-700" />
                  </button>
                  <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                    <Share className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Property Details */}
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    {formatPrice(property.price)}
                  </p>
                </div>
              </div>
              
              {/* Property Features */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Bed className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.bedrooms} beds</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bath className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.bathrooms} baths</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Square className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.area_sqm}m²</span>
                </div>
              </div>
              
              {/* Description */}
              {property.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>
              )}
              
              {/* Property Type and District */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {property.property_type}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {property.district}
                  </span>
                </div>
                
                <button className="btn-primary">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PropertyList