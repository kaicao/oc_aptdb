import { createContext, useContext, useState, ReactNode } from 'react'

// Simple translation context and hook
export type Language = 'no' | 'en' | 'zh'

interface Translation {
  [key: string]: string | Translation
}

const translations: Record<Language, Translation> = {
  no: {
    title: "Oslo Leiligheter",
    subtitle: "Eiendoms Transaksjonsdata",
    showing_results: "Viser {{start}}-{{end}} av {{total}}",
    search_filters: "Søkefilter",
    address: "Adresse",
    district: "Bydel",
    from_date: "Fra dato",
    to_date: "Til dato",
    search: "Søk",
    reset: "Nullstill",
    search_address_placeholder: "Søk etter adresse...",
    district_placeholder: "f.eks. Frogner",
    apartments: "Leiligheter",
    analytics: "Analyse",
    analytics_dashboard: "Analyse Dashboard",
    loading_analytics: "Laster analyser...",
    analytics_error: "Kunne ikke laste analyser",
    retry: "Prøv igjen",
    total_apartments: "Totale leiligheter",
    average_price: "Gjennomsnittspris",
    district_prices: "Priser per bydel",
    apartment_count: "Leilighet antall",
    district_statistics: "Detaljerte bydelstatistikker",
    district: "Bydel",
    avg_price: "Gjennomsnittspris",
    min_price: "Minste pris",
    max_price: "Høyeste pris",
    table_headers: {
      address: "Adresse",
      price: "Pris", 
      date: "Dato",
      area: "Areal",
      district: "Bydel",
      bedrooms: "Soverom",
      bathrooms: "Bad"
    },
    page_of: "Side {{current}} av {{total}}",
    apartment_locations: "Leilighet Plasseringer",
    map_error: "Kart midlertidig utilgjengelig",
    try_again: "Prøv igjen",
    view_history: "Se historikk",
    apartment_popup: {
      district: "Bydel",
      area: "Areal",
      date: "Dato"
    },
    transaction_history: "Transaksjonshistorie",
    download_csv: "Last ned CSV",
    close: "Lukk",
    transaction_table_headers: {
      date: "Dato",
      price: "Pris",
      area: "Areal"
    },
    loading_apartments: "Laster leiligheter...",
    something_went_wrong: "Noe gikk galt",
    reload_page: "Last inn siden på nytt"
  },
  en: {
    title: "Oslo Apartments",
    subtitle: "Real Estate Transaction Data",
    showing_results: "Showing {{start}}-{{end}} of {{total}}",
    search_filters: "Search Filters",
    address: "Address",
    district: "District",
    from_date: "From Date",
    to_date: "To Date",
    search: "Search",
    reset: "Reset",
    search_address_placeholder: "Search address...",
    district_placeholder: "e.g. Frogner",
    apartments: "Apartments",
    analytics: "Analytics",
    analytics_dashboard: "Analytics Dashboard",
    loading_analytics: "Loading analytics...",
    analytics_error: "Failed to load analytics",
    retry: "Retry",
    total_apartments: "Total Apartments",
    average_price: "Average Price",
    district_prices: "Average Prices by District",
    apartment_count: "Apartment Count",
    district_statistics: "Detailed District Statistics",
    district: "District",
    avg_price: "Average Price",
    min_price: "Minimum Price",
    max_price: "Maximum Price",
    table_headers: {
      address: "Address",
      price: "Price",
      date: "Date",
      area: "Area",
      district: "District", 
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms"
    },
    page_of: "Page {{current}} of {{total}}",
    apartment_locations: "Apartment Locations",
    map_error: "Map temporarily unavailable",
    try_again: "Try again",
    view_history: "View History",
    apartment_popup: {
      district: "District",
      area: "Area",
      date: "Date"
    },
    transaction_history: "Transaction History",
    download_csv: "Download CSV",
    close: "Close",
    transaction_table_headers: {
      date: "Date",
      price: "Price",
      area: "Area"
    },
    loading_apartments: "Loading apartments...",
    something_went_wrong: "Something went wrong",
    reload_page: "Reload Page"
  },
  zh: {
    title: "奥斯陆公寓",
    subtitle: "房地产交易数据",
    showing_results: "显示 {{start}}-{{end}} / 共 {{total}}",
    search_filters: "搜索筛选",
    address: "地址",
    district: "区域",
    from_date: "开始日期",
    to_date: "结束日期",
    search: "搜索",
    reset: "重置",
    search_address_placeholder: "搜索地址...",
    district_placeholder: "例如：Frogner",
    apartments: "公寓",
    table_headers: {
      address: "地址",
      price: "价格",
      date: "日期",
      area: "面积",
      district: "区域",
      bedrooms: "卧室",
      bathrooms: "浴室"
    },
    page_of: "第 {{current}} 页，共 {{total}} 页",
    apartment_locations: "公寓位置",
    map_error: "地图暂时无法使用",
    try_again: "重试",
    view_history: "查看历史",
    apartment_popup: {
      district: "区域",
      area: "面积",
      date: "日期"
    },
    transaction_history: "交易历史",
    download_csv: "下载CSV",
    close: "关闭",
    transaction_table_headers: {
      date: "日期",
      price: "价格",
      area: "面积"
    },
    loading_apartments: "加载公寓中...",
    something_went_wrong: "出现错误",
    reload_page: "重新加载页面"
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, any>) => string
  i18n: { language: Language; changeLanguage: (lang: Language) => void }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('no') // Always default to Norwegian

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      // Fallback to Norwegian if translation not found
      value = translations['no']
      for (const k of keys) {
        value = value?.[k]
      }
    }
    
    if (typeof value !== 'string') {
      return key // Return key if not found
    }
    
    // Replace placeholders like {{start}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key]?.toString() || match
      })
    }
    
    return value
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, i18n: { language, changeLanguage: setLanguage } }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}