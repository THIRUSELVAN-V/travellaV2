import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plane, Menu, X, User } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    onNavigate('home');
  };

  const navItems = [
    { name: 'Home', key: 'home' },
    { name: 'Booking', key: 'booking' },
    { name: 'My Bookings', key: 'mybookings' },
    { name: 'Chat', key: 'chat' },
    { name: 'Itinerary', key: 'itinerary' }
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-xl font-bold flex-shrink-0"
            style={{ color: '#36bcf8' }}
          >
            <Plane className="h-8 w-8" />
            <span>TravelAI</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = currentPage === item.key;
              const isHovered = hoveredItem === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className="px-3 py-2 rounded-md transition-all duration-200 font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: isActive ? '#36bcf8' : isHovered ? '#36bcf8' : 'transparent',
                    color: isActive || isHovered ? 'white' : '#374151'
                  }}
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {user.username || user.email || 'User'}
                  </span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-2"
                  style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => onNavigate('login')}
                  variant="outline"
                  className="border-2"
                  style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => onNavigate('register')}
                  className="text-white"
                  style={{ backgroundColor: '#36bcf8' }}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = currentPage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate(item.key);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? '#36bcf8' : 'transparent',
                      color: isActive ? 'white' : '#374151'
                    }}
                  >
                    {item.name}
                  </button>
                );
              })}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center px-3 py-2">
                      <User className="h-5 w-5 text-gray-700 mr-2" />
                      <span className="text-sm text-gray-700 font-medium">
                        {user.username || user.email || 'User'}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-2"
                      style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        onNavigate('login');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-2"
                      style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        onNavigate('register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-white"
                      style={{ backgroundColor: '#36bcf8' }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}