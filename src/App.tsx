import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Booking } from './components/Booking';
import { BookingDetails } from './components/BookingDetails';
import BookingProcess from './components/BookingProcess';
import { Itinerary } from './components/Itinerary';
import MyBookings from './components/MyBookings';
import Chat from './components/Chat';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pagePayload, setPagePayload] = useState(null);

  const handleNavigate = (page, payload = null) => {
    setCurrentPage(page);
    setPagePayload(payload);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'booking':
        return <Booking onNavigate={handleNavigate} />;
      case 'mybookings':
        return <MyBookings onNavigate={handleNavigate} />;
      case 'bookingDetails':
        return <BookingDetails onNavigate={handleNavigate} payload={pagePayload} />;      
      case 'bookingProcess':
        return <BookingProcess onNavigate={handleNavigate} payload={pagePayload} />;
      case 'chat':
        return <Chat />;
      case 'itinerary':
        return <Itinerary onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}
