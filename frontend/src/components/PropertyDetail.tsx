import React from 'react'
import { X, MapPin, Bed, Bath, Square, Heart, Share, Phone, Mail, Calendar, MessageCircle } from 'lucide-react'
import type { Property } from '../App'

interface PropertyDetailProps {
  property: Property
  onClose: () => void
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onClose }) => {
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Share className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="aspect-video bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center mb-4">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="text-white text-center">
                  <Square className="w-16 h-16 mx-auto mb-2" />
                  <p>Property Images</p>
                </div>
              )}
            </div>
            
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded">
                    <img 
                      src={image} 
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <p className="text-3xl font-bold text-primary-600 mb-2">
                  {formatPrice(property.price)}
                </p>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                    {property.district}
                  </span>
                  <span className="ml-2 bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm">
                    {property.property_type}
                  </span>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Bed className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-xl font-bold text-gray-900">{property.bedrooms}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Bath className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-xl font-bold text-gray-900">{property.bathrooms}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Square className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-xl font-bold text-gray-900">{property.area_sqm}m²</p>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium">{property.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium capitalize ${property.status === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
                        {property.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">District:</span>
                      <span className="font-medium">{property.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{property.area_sqm}m²</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">+47 123 456 78</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">contact@ocaptdb.no</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Available 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Agent</h3>
                
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold text-xl">OC</span>
                  </div>
                  <p className="font-medium text-gray-900">OC_APTDB Team</p>
                  <p className="text-gray-600 text-sm">Oslo Real Estate</p>
                </div>

                <div className="space-y-3">
                  <button className="w-full btn-primary flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700">
                      Schedule Viewing
                    </button>
                    <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700">
                      Calculate Mortgage
                    </button>
                    <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700">
                      Compare Properties
                    </button>
                  </div>
                </div>

                {/* Listing Date */}
                <div className="mt-6 pt-6 border-t">
                  <div className="text-xs text-gray-500">
                    <p>Listed: {formatDate(property.created_at)}</p>
                    {property.updated_at !== property.created_at && (
                      <p>Updated: {formatDate(property.updated_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail