import React, { useState } from 'react'
import { Menu, X, Home, Search, User, Settings, LogOut } from 'lucide-react'

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OC</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">OC_APTDB</h1>
                <p className="text-xs text-gray-600">Oslo Real Estate</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Properties
            </a>
            <a 
              href="#" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Districts
            </a>
            <a 
              href="#" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Market Trends
            </a>
            <a 
              href="#" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              About
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Account</span>
              </button>
              
              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </a>
                  <hr className="my-1" />
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <a 
                href="#" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Properties
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Districts
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Market Trends
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                About
              </a>
              
              <hr className="my-2" />
              
              <div className="flex flex-col space-y-2">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  <User className="w-4 h-4" />
                  <span>Account</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header