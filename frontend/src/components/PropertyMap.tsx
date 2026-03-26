import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Home } from 'lucide-react'
import type { Property } from '../App'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom property marker icon
const propertyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="#3b82f6"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <path d="M12.5 7l-2 4h4l-2-4z" fill="#3b82f6"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface PropertyMapProps {
  properties: Property[]
  onPropertyClick: (property: Property) => void
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onPropertyClick }) => {
  const mapRef = useRef<L.Map | null>(null)

  // Oslo center coordinates
  const osloCenter: [number, number] = [59.9139, 10.7522]

  // Filter properties that have coordinates
  const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude)

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₹${(price / 1000000).toFixed(1)}M`
    }
    return `₹${(price / 1000).toFixed(0)}K`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-500'
      case 'sold':
        return 'bg-red-500'
      case 'rented':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  useEffect(() => {
    if (mapRef.current && propertiesWithCoords.length > 0) {
      // Fit map to show all properties
      const bounds = L.latLngBounds(
        propertiesWithCoords.map(p => [p.latitude!, p.longitude!])
      )
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [propertiesWithCoords])

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border h-96 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties on map</h3>
          <p className="mt-1 text-sm text-gray-500">
            No properties have location data available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primary-600" />
          Property Locations ({propertiesWithCoords.length} properties)
        </h3>
      </div>
      
      <div className="h-96 relative">
        <MapContainer
          center={osloCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {propertiesWithCoords.map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude!, property.longitude!]}
              icon={propertyIcon}
              eventHandlers={{
                click: () => onPropertyClick(property)
              }}
            >
              <Popup>
                <div className="min-w-64">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary-100 rounded flex items-center justify-center">
                          <Home className="w-8 h-8 text-primary-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {property.address}
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(property.price)}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(property.status)}`}></div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-600 mb-3">
                        <span>{property.bedrooms} beds</span>
                        <span>{property.bathrooms} baths</span>
                        <span>{property.area_sqm}m²</span>
                      </div>
                      
                      <button
                        onClick={() => onPropertyClick(property)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white text-xs py-2 px-3 rounded transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-sm border text-xs">
          <div className="font-medium text-gray-900 mb-2">Property Status</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Sold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Rented</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyMap