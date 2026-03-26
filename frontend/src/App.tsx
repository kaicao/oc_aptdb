import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { MapPin, Home, Search, Download, ChevronLeft, ChevronRight, Globe, ChevronUp, ChevronDown, BarChart3 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import { useTranslation, Language } from './useTranslation'
import { 
  fetchApartments as fetchApartmentsAPI, 
  fetchApartmentHistory
} from './mockData'
// import Analytics from './components/Analytics'

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
        <div className="text-center p-8 bg-white rounded-xl shadow-xl border border-gray-100 max-w-md backdrop-blur-sm">
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-indigo-600" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-100 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                  <p className="text-sm text-gray-600">{t('subtitle')}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-xs text-amber-600 font-medium">Demo Data - Not Real Norwegian Real Estate</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-4">
                  <Link 
                    to="/" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    {t('apartments') || 'Apartments'}
                  </Link>
                  <Link 
                    to="/analytics" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {/* {t('analytics') || 'Analytics'} */}
                  </Link>
                </nav>
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
          {/* Demo Data Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-semibold text-amber-900 mb-1">
                  Demo Data Notice
                </h3>
                <div className="text-sm text-amber-800 leading-relaxed">
                  <p>
                    This website displays <strong>simulated apartment data</strong> for demonstration purposes. 
                    All listings, prices, and transaction history are <strong>not real</strong> and should not be used for actual real estate decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Search className="w-6 h-6 mr-2 text-indigo-600" />
              {t('search_filters')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('address')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200"
                  placeholder={t('search_address_placeholder')}
                  value={searchFilters.address}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('district')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200"
                  placeholder={t('district_placeholder')}
                  value={searchFilters.district}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('from_date')}</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200"
                  value={searchFilters.start_date}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('to_date')}</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200"
                  value={searchFilters.end_date}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl flex items-center disabled:opacity-50 shadow-lg transition-all duration-200"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('search')}
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl border border-gray-200 transition-all duration-200"
              >
                {t('reset')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Home className="w-6 h-6 mr-2 text-indigo-600" />
                  {t('apartments')} ({apartments.length})
                  <span className="text-sm font-medium text-amber-600 ml-3 px-3 py-1 bg-amber-100 rounded-full">
                    DEMO DATA
                  </span>
                </h2>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">{t('loading_apartments')}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-slate-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200" onClick={() => handleSort('address')}>
                            <div className="flex items-center">
                              {t('table_headers.address')}
                              <div className="ml-1">{getSortIcon('address')}</div>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200" onClick={() => handleSort('price')}>
                            <div className="flex items-center">
                              {t('table_headers.price')}
                              <div className="ml-1">{getSortIcon('price')}</div>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200" onClick={() => handleSort('transaction_date')}>
                            <div className="flex items-center">
                              {t('table_headers.date')}
                              <div className="ml-1">{getSortIcon('transaction_date')}</div>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200" onClick={() => handleSort('area_sqm')}>
                            <div className="flex items-center">
                              {t('table_headers.area')}
                              <div className="ml-1">{getSortIcon('area_sqm')}</div>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200" onClick={() => handleSort('district')}>
                            <div className="flex items-center">
                              {t('table_headers.district')}
                              <div className="ml-1">{getSortIcon('district')}</div>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200" onClick={() => handleSort('bedrooms')}>
                            <div className="flex items-center">
                              {t('table_headers.bedrooms')}
                              <div className="ml-1">{getSortIcon('bedrooms')}</div>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedApartments.map((apartment) => (
                          <tr
                            key={apartment.id}
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 ${
                              selectedApartment?.id === apartment.id ? 'bg-gradient-to-r from-indigo-100 to-blue-100 border-l-4 border-indigo-500' : ''
                            }`}
                            onClick={() => handleApartmentClick(apartment)}
                          >
                            <td className="px-6 py-5">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{apartment.address}</div>
                                <div className="text-sm text-indigo-600 font-medium">{apartment.district}</div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm font-bold text-gray-900">{formatPrice(apartment.price)}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-sm text-gray-600">{formatDate(apartment.transaction_date)}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {apartment.area_sqm} m²
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {apartment.district}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {apartment.bedrooms} BR
                              </div>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" style={{ zIndex: 9999, position: 'fixed' }}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-100">
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

// Main App component with routing
function AppWithRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ApartmentListApp />} />
        {/* <Route path="/analytics" element={<Analytics />} /> */}
      </Routes>
    </Router>
  )
}

function ApartmentListApp() {
  return <App />
}

export default AppWithRouter