import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, Hotel, Car, CheckCircle, XCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function UserBookingsPage({ onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  };

  const toggleBookingDetails = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const calculateTotalCost = (booking) => {
    if (booking.totalCost) return booking.totalCost;
    
    let total = 0;
    
    // Add hotel costs from customPlan
    if (booking.customPlan) {
      booking.customPlan.forEach(day => {
        if (day.Hotel?.perDay) {
          total += day.Hotel.perDay;
        }
      });
    }
    
    // Add car rental cost
    if (booking.carRental?.perDay) {
      const duration = calculateDuration(booking.startDate, booking.endDate);
      total += booking.carRental.perDay * duration;
    }
    
    return total;
  };

  const filteredBookings = bookings.filter((b) => filterStatus === 'all' || (b.status?.toLowerCase() || 'pending') === filterStatus);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Bookings</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600 mb-4">View and manage all your travel bookings</p>
          <div className="flex gap-2 flex-wrap">
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === status 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-lg">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start planning your next adventure!</p>
            <button
              onClick={() => onNavigate && onNavigate('destinations')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Explore Destinations
            </button>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isExpanded = expandedBooking === booking._id;
            const duration = calculateDuration(booking.startDate, booking.endDate);
            const totalCost = calculateTotalCost(booking);
            const hasCarRental = !!booking.carRental;

            return (
              <div key={booking._id} className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        {booking.destinationId?.name || 'Unknown Destination'}
                      </h2>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{booking.guests} {booking.guests > 1 ? 'guests' : 'guest'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{duration} {duration > 1 ? 'days' : 'day'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                    <p className="text-3xl font-bold text-blue-600 mb-3">${totalCost}</p>
                    <button
                      onClick={() => toggleBookingDetails(booking._id)}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {isExpanded ? (
                        <>
                          Hide Details <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-6">
                    {/* Day-wise Itinerary */}
                    {booking.customPlan?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          Day-wise Itinerary
                        </h3>
                        <div className="space-y-4">
                          {booking.customPlan.map((dayPlan, idx) => (
                            <div key={dayPlan._id || idx} className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-blue-700 text-lg">
                                  Day {idx + 1} - {formatDate(dayPlan.date)}
                                </h4>
                                {dayPlan.Hotel && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Hotel className="w-4 h-4 text-green-600" />
                                    <span className="font-medium">{dayPlan.Hotel.name}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Places for this day */}
                              {dayPlan.places?.length > 0 ? (
                                <div className="space-y-2 mb-4">
                                  <p className="text-sm font-semibold text-gray-700 mb-2">Attractions:</p>
                                  {dayPlan.places.map((place, placeIdx) => (
                                    <div
                                      key={place._id || placeIdx}
                                      className="flex items-center justify-between bg-blue-50 rounded-lg p-3"
                                    >
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{place.place}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full capitalize">
                                            {place.timeSlot}
                                          </span>
                                          {place.price > 0 && (
                                            <span className="text-xs font-semibold text-green-600">
                                              ${place.price}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic mb-4">No attractions planned for this day</p>
                              )}
                              
                              {/* Hotel for this day */}
                              {dayPlan.Hotel && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Hotel className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="font-semibold text-gray-900">{dayPlan.Hotel.name}</p>
                                      <p className="text-xs text-gray-600">Accommodation</p>
                                    </div>
                                  </div>
                                  {dayPlan.Hotel.perDay && (
                                    <p className="text-lg font-bold text-green-600">${dayPlan.Hotel.perDay}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Car Rental */}
                    {hasCarRental && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Car className="w-5 h-5 text-purple-600" />
                          Car Rental
                        </h3>
                        <div className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{booking.carRental.model}</p>
                              {booking.carRental.providerContact && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Contact: {booking.carRental.providerContact}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 mt-1">
                                ${booking.carRental.perDay}/day × {duration} days
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                              ${booking.carRental.perDay * duration}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Summary */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h3>
                      <div className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                        <div className="space-y-3">
                          {/* Hotel costs */}
                          {booking.customPlan?.some(day => day.Hotel) && (
                            <div className="flex justify-between text-sm pb-2 border-b border-gray-200">
                              <span className="text-gray-700">Hotels ({booking.customPlan.filter(d => d.Hotel).length} nights)</span>
                              <span className="font-semibold text-gray-900">
                                ${booking.customPlan.reduce((sum, day) => sum + (day.Hotel?.perDay || 0), 0)}
                              </span>
                            </div>
                          )}
                          
                          {/* Car rental cost */}
                          {hasCarRental && (
                            <div className="flex justify-between text-sm pb-2 border-b border-gray-200">
                              <span className="text-gray-700">Car Rental ({duration} days)</span>
                              <span className="font-semibold text-gray-900">
                                ${booking.carRental.perDay * duration}
                              </span>
                            </div>
                          )}
                          
                          {/* Total */}
                          <div className="flex justify-between pt-2">
                            <span className="text-lg font-bold text-gray-900">Total Cost</span>
                            <span className="text-2xl font-bold text-blue-600">${totalCost}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
                      <p><strong>Booking ID:</strong> {booking._id}</p>
                      <p><strong>Created:</strong> {formatDate(booking.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}