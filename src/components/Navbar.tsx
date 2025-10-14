import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plane, Menu, X, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
  };

  const navItems = [
    { name: 'Home', key: 'home' },
    { name: 'Booking', key: 'booking' },
    { name: 'Chat', key: 'chat' },
    { name: 'Itinerary', key: 'itinerary' }
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-xl font-bold"
              style={{ color: '#36bcf8' }}
            >
              <Plane className="h-8 w-8" />
              <span>TravelAI</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentPage === item.key
                    ? 'text-white'
                    : 'text-gray-700 hover:text-white hover:bg-opacity-80'
                }`}
                style={{
                  backgroundColor: currentPage === item.key ? '#36bcf8' : 'transparent',
                  ...(currentPage !== item.key && {
                    ':hover': { backgroundColor: '#36bcf8' }
                  })
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.key) {
                    e.currentTarget.style.backgroundColor = '#36bcf8';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                {item.name}
              </button>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user.user_metadata?.name || user.email}</span>
                </div>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-2"
                  style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
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
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                    currentPage === item.key
                      ? 'text-white'
                      : 'text-gray-700 hover:text-white hover:bg-opacity-80'
                  }`}
                  style={{
                    backgroundColor: currentPage === item.key ? '#36bcf8' : 'transparent'
                  }}
                >
                  {item.name}
                </button>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center px-3 py-2">
                    <User className="h-5 w-5 text-gray-700 mr-2" />
                    <span className="text-sm text-gray-700">{user.user_metadata?.name || user.email}</span>
                  </div>
                  <Button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="mx-3 border-2 w-full"
                    style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2 px-2">
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}