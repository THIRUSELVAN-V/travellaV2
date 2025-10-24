import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function Booking({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('hotels');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests');
  const [rating, setRating] = useState('All Ratings');

  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = '';
        switch (activeTab) {
          case 'destinations':
            endpoint = `${BASE_URL}/destinations`;
            break;
          case 'hotels':
            endpoint = `${BASE_URL}/hotels`;
            break;
          case 'cars':
            endpoint = `${BASE_URL}/carrentals`;
            break;
          default:
            return;
        }
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
        const data = await response.json();
        switch (activeTab) {
          case 'destinations':
            setDestinations(data);
            break;
          case 'hotels':
            setHotels(data);
            break;
          case 'cars':
            setCars(data);
            break;
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleSearch = () => {
    console.log({ activeTab, destination, checkIn, checkOut, guests });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="mt-12 flex justify-center items-center py-20">
          <div className="text-slate-600 dark:text-slate-400 text-xl">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-12 flex justify-center items-center py-20">
          <div className="text-red-600 dark:text-red-400 text-xl">Error: {error}</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'destinations':
        return (
          <section className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {destinations.length} Popular Destinations
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest) => (
                <div
                  key={dest._id || dest.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
                >
                  <img
                    alt={`View of ${dest.name}`}
                    className="w-full h-48 object-cover"
                    src={(dest.images && dest.images[0]) || dest.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'}
                  />
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{dest.name}</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {dest.city && dest.country ? `${dest.city}, ${dest.country}` : dest.country}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{dest.description}</p>
                    {dest.tags && dest.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {dest.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs font-medium px-3 py-1 bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-4">
                      <button
                        type="button"
                        onClick={() => onNavigate('bookingDetails', { destinationId: dest._id || dest.id })}
                        className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'hotels':
        return (
          <section className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{hotels.length} Available Hotels</h2>
              <div className="relative">
                <select
                  className="w-48 pl-4 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option>All Ratings</option>
                  <option>5 Stars</option>
                  <option>4 Stars & up</option>
                  <option>3 Stars & up</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <div
                  key={hotel._id || hotel.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
                >
                  <img
                    alt={`View of ${hotel.name}`}
                    className="w-full h-48 object-cover"
                    src={(hotel.images && hotel.images[0]) || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'}
                  />
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{hotel.name}</h3>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        ${hotel.pricePerNight || hotel.price}/night
                      </p>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {hotel.city && hotel.country ? `${hotel.city}, ${hotel.country}` : hotel.location || hotel.city}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hotel.amenities &&
                        hotel.amenities.slice(0, 2).map((amenity, index) => (
                          <span
                            key={index}
                            className="text-xs font-medium px-3 py-1 bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      {hotel.amenities && hotel.amenities.length > 2 && (
                        <span className="text-xs font-medium px-3 py-1 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full">
                          +{hotel.amenities.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-4">
                      <button className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'cars':
        return (
          <section className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{cars.length} Available Rental Cars</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <div
                  key={car._id || car.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
                >
                  <img
                    alt={`View of ${car.name}`}
                    className="w-full h-48 object-cover"
                    src={(car.images && car.images[0]) || car.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'}
                  />
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{car.name || car.model}</h3>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        ${car.pricePerDay || car.price}/day
                      </p>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{car.type || car.category}</p>
                    {car.features && car.features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {car.features.slice(0, 2).map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs font-medium px-3 py-1 bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {car.features.length > 2 && (
                          <span className="text-xs font-medium px-3 py-1 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full">
                            +{car.features.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto pt-4">
                      <button className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1300px', width: '100%' }}>
        <main className="py-8 md:py-12">
          <section className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Your Perfect Getaway Awaits
            </h1>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Discover exclusive destinations, luxury hotels, and premium cars all in one place
            </p>
          </section>

          <section className="mt-12 flex justify-center">
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md inline-flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('destinations')}
                className={`px-6 py-2 rounded-full transition-colors ${
                  activeTab === 'destinations'
                    ? 'text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Destinations
              </button>
              <button
                onClick={() => setActiveTab('hotels')}
                className={`px-6 py-2 rounded-full transition-colors ${
                  activeTab === 'hotels'
                    ? 'text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Hotels
              </button>
              <button
                onClick={() => setActiveTab('cars')}
                className={`px-6 py-2 rounded-full transition-colors ${
                  activeTab === 'cars'
                    ? 'text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Rental Cars
              </button>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="destination">
                    {activeTab === 'destinations'
                      ? 'Search Destination'
                      : activeTab === 'hotels'
                      ? 'Hotel Location'
                      : 'Pickup Location'}
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    id="destination"
                    placeholder={
                      activeTab === 'destinations'
                        ? 'Where to?'
                        : activeTab === 'hotels'
                        ? 'City or hotel name'
                        : 'Pickup city'
                    }
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {activeTab !== 'destinations' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="check-in">
                        {activeTab === 'cars' ? 'Pickup Date' : 'Check-in'}
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        id="check-in"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="check-out">
                        {activeTab === 'cars' ? 'Return Date' : 'Check-out'}
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        id="check-out"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="guests">
                        {activeTab === 'cars' ? 'Passengers' : 'Guests'}
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                        id="guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      >
                        <option>1 Guest</option>
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4 Guests</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  onClick={handleSearch}
                  className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                  type="button"
                >
                  Search
                </button>
              </div>
            </div>
          </section>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
