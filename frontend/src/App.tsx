import React, { useState, useEffect, useCallback } from 'react'
import { MapPin, Home, Search, Download, ChevronLeft, ChevronRight, Globe, ChevronUp, ChevronDown } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import { useTranslation, Language } from './useTranslation'
import { 
  fetchApartments as fetchApartmentsAPI, 
  fetchApartmentHistory
} from './mockData'

// Create custom apartment icon
const apartmentIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 30 15 30s15-15 15-30C30 6.7 23.3 0 15 0z" fill="#2563eb"/>
      <circle cx="15" cy="15" r="8" fill="white"/>
      <path d="M15 7l-3 6h6l-3-6z" fill="#2563eb"/>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
})

// Language switcher component
function LanguageSwitcher() {
  const { i18n } = useTranslation()
  
  const languages = [
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng as Language)
  }
  
  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}

interface Apartment {
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
}

interface TransactionHistory {
  apartment_id: number
  apartment_address: string
  transactions: {
    id: number
    price: number
    transaction_date: string
    area_sqm: number
  }[]
}

interface SearchFilters {
  address: string
  district: string
  start_date: string
  end_date: string
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.message)
      setHasError(true)
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    const { t } = useTranslation()
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">{t('something_went_wrong')}</h2>
          <p className="text-gray-600 mb-4">{error || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('reload_page')}
          </button>
        </div>
      </div>
    )
  }

  return children
}

function MapComponent({ 
  apartments, 
  onApartmentClick 
}: { 
  apartments: Apartment[]
  onApartmentClick: (apartment: Apartment) => void 
}) {
  const [mapError, setMapError] = useState(false)
  const { t } = useTranslation()
  const osloCenter: [number, number] = [59.9139, 10.7522]

  const formatPrice = useCallback((price: number) => {
    const locale = t('price_format') === '挪威克朗' ? 'zh-CN' : 'no-NO'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }, [t])

  const formatDate = useCallback((dateString: string) => {
    const locale = t('price_format') === '挪威克朗' ? 'zh-CN' : 'no-NO'
    return new Date(dateString).toLocaleDateString(locale)
  }, [t])

  if (mapError) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            {t('apartment_locations')} ({apartments.length})
          </h2>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('map_error')}</p>
            <button 
              onClick={() => setMapError(false)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {t('try_again')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          {t('apartment_locations')} ({apartments.length})
        </h2>
      </div>
      <div className="h-96">
        <ErrorBoundary>
          <MapContainer
            center={osloCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            whenReady={() => {
              setTimeout(() => {
                const map = document.querySelector('.leaflet-container')
                if (!map) {
                  setMapError(true)
                }
              }, 100)
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {apartments.map((apartment) => (
              <Marker
                key={apartment.id}
                position={[apartment.latitude, apartment.longitude]}
                icon={apartmentIcon}
                eventHandlers={{
                  click: () => onApartmentClick(apartment)
                }}
              >
                <Popup>
                  <div className="min-w-64">
                    <h4 className="font-medium">{apartment.address}</h4>
                    <p className="text-sm text-gray-600">{apartment.district}</p>
                    <p className="font-bold text-blue-600">{formatPrice(apartment.price)}</p>
                    <p className="text-sm">{t('apartment_popup.area')}: {apartment.area_sqm} m²</p>
                    <p className="text-sm">{t('apartment_popup.date')}: {formatDate(apartment.transaction_date)}</p>
                    <button
                      onClick={() => onApartmentClick(apartment)}
                      className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      {t('view_history')}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </ErrorBoundary>
      </div>
    </div>
  )
}

function App() {
  const { t, i18n } = useTranslation()
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    address: '',
    district: '',
    start_date: '',
    end_date: ''
  })
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const itemsPerPage = 25

  // Sorting function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // Get sorted apartments
  const sortedApartments = React.useMemo(() => {
    if (!sortConfig) return apartments

    return [...apartments].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Apartment]
      const bValue = b[sortConfig.key as keyof Apartment]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (sortConfig.key === 'price' || sortConfig.key === 'area_sqm' || sortConfig.key === 'bedrooms' || sortConfig.key === 'bathrooms') {
        const numA = Number(aValue)
        const numB = Number(bValue)
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA
      } else if (sortConfig.key === 'transaction_date') {
        const dateA = new Date(aValue as string).getTime()
        const dateB = new Date(bValue as string).getTime()
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        const strA = String(aValue).toLowerCase()
        const strB = String(bValue).toLowerCase()
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      }
    })
  }, [apartments, sortConfig])

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />
  }

  useEffect(() => {
    loadApartments()
  }, [currentPage, searchFilters])

  const loadApartments = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      if (searchFilters.address) params.append('address', searchFilters.address)
      if (searchFilters.district) params.append('district', searchFilters.district)
      if (searchFilters.start_date) params.append('start_date', searchFilters.start_date)
      if (searchFilters.end_date) params.append('end_date', searchFilters.end_date)
      
      const data = await fetchApartmentsAPI(params.toString())
      setApartments(data.apartments)
      setTotal(data.total)
      setTotalPages(data.pages)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching apartments:', error)
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        setApartments(getMockData())
        setTotal(25)
        setTotalPages(1)
      }
      setIsLoading(false)
    }
  }

  const getMockData = (): Apartment[] => {
    return [
      {
        id: 1,
        address: "Kirkeveien 45, 0268 Oslo",
        district: "Frogner",
        latitude: 59.9241,
        longitude: 10.7341,
        price: 8500000,
        transaction_date: "2024-12-15T00:00:00",
        area_sqm: 75,
        bedrooms: 2,
        bathrooms: 1,
        property_type: "apartment"
      },
      {
        id: 2,
        address: "Thorvald Meyers gate 23, 0552 Oslo",
        district: "Grünerløkka",
        latitude: 59.9208,
        longitude: 10.7458,
        price: 4200000,
        transaction_date: "2024-12-10T00:00:00",
        area_sqm: 35,
        bedrooms: 1,
        bathrooms: 1,
        property_type: "apartment"
      },
      {
        id: 3,
        address: "Karl Johans gate 1, 0154 Oslo",
        district: "Sentrum",
        latitude: 59.9139,
        longitude: 10.7522,
        price: 12500000,
        transaction_date: "2024-12-08T00:00:00",
        area_sqm: 120,
        bedrooms: 3,
        bathrooms: 2,
        property_type: "apartment"
      }
    ]
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadApartments()
  }

  const handleReset = () => {
    setSearchFilters({ address: '', district: '', start_date: '', end_date: '' })
    setCurrentPage(1)
    loadApartments()
  }

  const handleApartmentClick = (apartment: Apartment) => {
    setSelectedApartment(apartment)
    fetchTransactionHistory(apartment.id)
    setShowHistory(true)
  }

  const fetchTransactionHistory = async (apartmentId: number) => {
    try {
      const response = await fetchApartmentHistory(apartmentId)
      setTransactionHistory(response)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      setTransactionHistory({
        apartment_id: apartmentId,
        apartment_address: selectedApartment?.address || 'Unknown',
        transactions: [
          {
            id: 1,
            price: 7800000,
            transaction_date: "2024-12-15T00:00:00",
            area_sqm: 75
          },
          {
            id: 2,
            price: 8100000,
            transaction_date: "2023-06-20T00:00:00",
            area_sqm: 75
          }
        ]
      })
    }
  }

  const downloadHistory = () => {
    if (!transactionHistory) return
    
    const csvContent = [
      [t('transaction_table_headers.date'), t('transaction_table_headers.price'), t('transaction_table_headers.area')],
      ...transactionHistory.transactions
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
        .map(tx => {
          const locale = i18n.language === 'zh' ? 'zh-CN' : 'no-NO'
          return [
            new Date(tx.transaction_date).toLocaleDateString(locale),
            tx.price.toLocaleString(locale),
            tx.area_sqm.toString()
          ]
        })
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `apartment_${transactionHistory.apartment_id}_history.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const formatPrice = (price: number) => {
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'no-NO'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'no-NO'
    return new Date(dateString).toLocaleDateString(locale)
  }

  if (isLoading && apartments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_apartments')}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Home className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                  <p className="text-sm text-gray-600">{t('subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {t('showing_results', {
                      start: Math.min((currentPage - 1) * itemsPerPage + 1, total),
                      end: Math.min(currentPage * itemsPerPage, total),
                      total: total
                    })}
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">{t('search_filters')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('address')}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('search_address_placeholder')}
                  value={searchFilters.address}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('district')}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('district_placeholder')}
                  value={searchFilters.district}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('from_date')}</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchFilters.start_date}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('to_date')}</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchFilters.end_date}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('search')}
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
              >
                {t('reset')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {t('apartments')} ({apartments.length})
                </h2>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('address')}>
                            <div className="flex items-center">
                              {t('table_headers.address')}
                              {getSortIcon('address')}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('price')}>
                            <div className="flex items-center">
                              {t('table_headers.price')}
                              {getSortIcon('price')}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('transaction_date')}>
                            <div className="flex items-center">
                              {t('table_headers.date')}
                              {getSortIcon('transaction_date')}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('area_sqm')}>
                            <div className="flex items-center">
                              {t('table_headers.area')}
                              {getSortIcon('area_sqm')}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('district')}>
                            <div className="flex items-center">
                              {t('table_headers.district')}
                              {getSortIcon('district')}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('bedrooms')}>
                            <div className="flex items-center">
                              {t('table_headers.bedrooms')}
                              {getSortIcon('bedrooms')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedApartments.map((apartment) => (
                          <tr
                            key={apartment.id}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              selectedApartment?.id === apartment.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => handleApartmentClick(apartment)}
                          >
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{apartment.address}</div>
                                <div className="text-sm text-gray-500">{apartment.district}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                              {formatPrice(apartment.price)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(apartment.transaction_date)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {apartment.area_sqm} m²
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {apartment.district}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {apartment.bedrooms}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="px-4 py-3 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {t('page_of', { current: currentPage, total: totalPages })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || isLoading}
                        className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || isLoading}
                        className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Map */}
            <MapComponent
              apartments={apartments}
              onApartmentClick={handleApartmentClick}
            />
          </div>
        </div>

        {/* Transaction History Modal */}
        {showHistory && selectedApartment && transactionHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ zIndex: 9999, position: 'fixed' }}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{t('transaction_history')}</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600">{transactionHistory.apartment_address}</p>
              </div>
              <div className="p-6">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={downloadHistory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('download_csv')}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('transaction_table_headers.date')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('transaction_table_headers.price')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('transaction_table_headers.area')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactionHistory.transactions
                        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                        .map((tx, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{formatDate(tx.transaction_date)}</td>
                          <td className="px-4 py-3 text-sm font-medium">{formatPrice(tx.price)}</td>
                          <td className="px-4 py-3 text-sm">{tx.area_sqm} m²</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App