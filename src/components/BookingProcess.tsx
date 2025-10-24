import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, MapPin, Clock, CheckCircle, Plus, X, ArrowRight, Hotel as HotelIcon, Car, User, Star, Loader, Info } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function BookingProcess({ payload, onNavigate }) {
  // Trip details
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  
  // Planning state
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('morning');
  const [dayPlans, setDayPlans] = useState({});
  const [selectedHotels, setSelectedHotels] = useState({});
  
  // Car rental state
  const [needCarRental, setNeedCarRental] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detailsModalPlace, setDetailsModalPlace] = useState(null);
  
  // API data state
  const [attractions, setAttractions] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const destinationId = payload?.destinationId || '68f4e1f3799c75cb6da8a632';
  const destinationName = payload?.destinationName || 'Paris';

  const timeSlots = ['morning', 'afternoon', 'evening'];

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch attractions/places
        try {
          const placesRes = await fetch(`${BASE_URL}/places/destination/${destinationId}`);
          if (placesRes.ok) {
            const placesData = await placesRes.json();
            setAttractions(Array.isArray(placesData) ? placesData : []);
          } else {
            setAttractions([]);
          }
        } catch (err) {
          console.warn('Could not fetch attractions:', err);
          setAttractions([]);
        }

        // Fetch hotels
        try {
          const hotelsRes = await fetch(`${BASE_URL}/hotels/destination/${destinationId}`);
          if (hotelsRes.ok) {
            const hotelsData = await hotelsRes.json();
            setHotels(Array.isArray(hotelsData) ? hotelsData : []);
          } else {
            setHotels([]);
          }
        } catch (err) {
          console.warn('Could not fetch hotels:', err);
          setHotels([]);
        }

        // Fetch car rentals
        try {
          const carsRes = await fetch(`${BASE_URL}/carrentals/destination/${destinationId}`);
          if (carsRes.ok) {
            const carsData = await carsRes.json();
            setCars(Array.isArray(carsData) ? carsData : []);
          } else {
            setCars([]);
          }
        } catch (err) {
          console.warn('Could not fetch car rentals:', err);
          setCars([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [destinationId]);

  const tripDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const formatTime = (hours) => {
    if (hours >= 1) return `${hours}h`;
    return `${Math.round(hours * 60)}m`;
  };

  const totalHotelCost = useMemo(() => {
    return Object.values(selectedHotels).reduce((sum, hotel) => {
      return sum + (hotel?.pricePerNight || 0);
    }, 0);
  }, [selectedHotels]);

  const totalCarCost = useMemo(() => {
    if (!needCarRental || !selectedCar) return 0;
    return selectedCar.pricePerDay * tripDays;
  }, [needCarRental, selectedCar, tripDays]);

  const totalCost = totalHotelCost + totalCarCost;

  const getFilteredAttractions = () => {
    return attractions.filter(a => a.time_slot === selectedTimeSlot);
  };

  const handleAddAttraction = (attraction) => {
    const key = `${selectedDayIndex}-${selectedTimeSlot}`;
    setDayPlans((prev) => {
      const current = prev[key];
      
      if (current?._id === attraction._id) {
        const newPlans = { ...prev };
        delete newPlans[key];
        return newPlans;
      }
      
      return {
        ...prev,
        [key]: attraction,
      };
    });
  };

  const isAttractionSelected = (attractionId) => {
    const key = `${selectedDayIndex}-${selectedTimeSlot}`;
    return dayPlans[key]?._id === attractionId;
  };

  const getPlansForDay = (dayIndex) => {
    const plans = [];
    timeSlots.forEach(slot => {
      const key = `${dayIndex}-${slot}`;
      if (dayPlans[key]) {
        plans.push({ slot, place: dayPlans[key] });
      }
    });
    return plans;
  };

  const handleSelectHotel = (dayIndex, hotel) => {
    setSelectedHotels((prev) => ({
      ...prev,
      [dayIndex]: hotel
    }));
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (tripDays === 0) {
        alert('Please select valid travel dates');
        return;
      }
      const emptyDays = [];
      for (let i = 0; i < tripDays; i++) {
        const dayPlansCount = getPlansForDay(i).length;
        if (dayPlansCount === 0) {
          emptyDays.push(i + 1);
        }
      }
      if (emptyDays.length > 0) {
        alert(`Please add at least one attraction for Day ${emptyDays.join(', ')}`);
        return;
      }
    }
    
    if (currentStep === 2) {
      const missingHotels = [];
      for (let i = 0; i < tripDays; i++) {
        if (!selectedHotels[i]) {
          missingHotels.push(i + 1);
        }
      }
      if (missingHotels.length > 0) {
        alert(`Please select a hotel for Day ${missingHotels.join(', ')}`);
        return;
      }
    }
    
    if (currentStep === 3) {
      if (needCarRental && !selectedCar) {
        alert('Please select a car type');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

 const handleConfirmBooking = async () => {
  try {
    // Build customPlan with date-based structure
    const customPlanMap = {};
    
    // Process day plans (attractions)
    Object.entries(dayPlans).forEach(([key, place]) => {
      const [dayIndex, slot] = key.split('-');
      const dayNumber = parseInt(dayIndex);
      
      // Calculate the actual date for this day
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + dayNumber);
      const dateStr = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      if (!customPlanMap[dateStr]) {
        customPlanMap[dateStr] = {
          date: dateStr,
          Hotel: null,
          places: []
        };
      }
      
      customPlanMap[dateStr].places.push({
        placeId: place._id,
        place: place.place_name,
        timeSlot: slot,
        price: place.price || 0,
      });
    });
    
    // Add hotels to each date
    Object.entries(selectedHotels).forEach(([dayIndex, hotel]) => {
      const dayNumber = parseInt(dayIndex);
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + dayNumber);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (!customPlanMap[dateStr]) {
        customPlanMap[dateStr] = {
          date: dateStr,
          Hotel: null,
          places: []
        };
      }
      
      customPlanMap[dateStr].Hotel = {
        id: hotel._id,
        name: hotel.name,
        perDay: hotel.pricePerNight,
      };
    });
    
    const customPlan = Object.values(customPlanMap);

    // Car rental mapping
    const carRental = needCarRental && selectedCar ? {
      carId: selectedCar._id,
      model: selectedCar.type || selectedCar.name,
      providerContact: selectedCar.contact || '',
      perDay: selectedCar.pricePerDay,
    } : undefined;

    // Booking payload aligned with new backend model
    const bookingData = {
      destinationId,
      startDate,
      endDate,
      guests,
      customPlan,
      ...(carRental && { carRental }),
      totalCost
    };

    console.log("API Payload:", bookingData);

    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create booking');
    }

    const result = await response.json();
    console.log('Booking created successfully:', result);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onNavigate && onNavigate('bookings');
    }, 3000);
  } catch (err) {
    console.error('Booking error:', err);
    alert('Failed to create booking: ' + err.message);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Stepper */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Trip Plan', icon: Calendar },
              { num: 2, label: 'Hotels', icon: HotelIcon },
              { num: 3, label: 'Transport', icon: Car },
              { num: 4, label: 'Review', icon: CheckCircle }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        currentStep >= step.num
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs mt-2 font-medium text-gray-600">
                      {step.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded transition-all ${
                        currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step 1: Trip Planning */}
        {currentStep === 1 && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Plan Your Trip to {destinationName}
              </h1>
              <p className="text-gray-600">
                Select travel dates, number of guests, and attractions for each time slot
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {tripDays > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    Trip Duration: {tripDays} {tripDays === 1 ? 'day' : 'days'} • {guests} {guests === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
              )}
            </div>

            {tripDays > 0 && (
              <>
                {/* Day Selection */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Day</h2>
                  <div className="flex gap-3 flex-wrap">
                    {Array.from({ length: tripDays }).map((_, i) => {
                      const dayPlansCount = getPlansForDay(i).length;
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDayIndex(i)}
                          className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
                            selectedDayIndex === i
                              ? 'bg-blue-600 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Day {i + 1}</span>
                          </div>
                          {dayPlansCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {dayPlansCount}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Select Time Slot for Day {selectedDayIndex + 1}
                  </h2>
                  <div className="flex gap-3">
                    {timeSlots.map(slot => {
                      const key = `${selectedDayIndex}-${slot}`;
                      const hasSelection = !!dayPlans[key];
                      
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`relative flex-1 px-6 py-4 rounded-xl font-semibold capitalize transition-all ${
                            selectedTimeSlot === slot
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{slot}</span>
                          </div>
                          {hasSelection && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Available Attractions */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Available Attractions - <span className="capitalize text-blue-600">{selectedTimeSlot}</span>
                      </h2>
                      {getFilteredAttractions().length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No attractions available for {selectedTimeSlot}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getFilteredAttractions().map((attraction) => {
                            const isSelected = isAttractionSelected(attraction._id);
                            
                            return (
                              <div
                                key={attraction._id}
                                className={`relative border-2 rounded-xl overflow-hidden transition-all ${
                                  isSelected
                                    ? 'border-blue-500 shadow-lg'
                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 z-10">
                                    <CheckCircle className="w-5 h-5" />
                                  </div>
                                )}
                                
                                {attraction.is_popular && (
                                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                                    <Star className="w-3 h-3" />
                                    Popular
                                  </div>
                                )}
                                
                                <img
                                  src={attraction.image_url || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'}
                                  alt={attraction.place_name}
                                  className="w-full h-32 object-cover"
                                />
                                
                                <div className="p-4">
                                  <h3 className="font-bold text-gray-900 mb-2 text-sm">
                                    {attraction.place_name}
                                  </h3>
                                  
                                  <div className="flex items-center justify-between mb-3">
                                    {attraction.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-medium">{attraction.rating.toFixed(1)}</span>
                                      </div>
                                    )}
                                    {attraction.duration_hours && (
                                      <span className="text-xs text-gray-600">
                                        {formatTime(attraction.duration_hours)}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {attraction.price > 0 && (
                                    <div className="text-sm font-bold text-green-600 mb-3">
                                      ${attraction.price}
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAddAttraction(attraction)}
                                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                                        isSelected
                                          ? 'bg-red-500 text-white hover:bg-red-600'
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      {isSelected ? 'Remove' : 'Add'}
                                    </button>
                                    <button
                                      onClick={() => setDetailsModalPlace(attraction)}
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                                    >
                                      <Info className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day Plan Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Day {selectedDayIndex + 1} Plan
                      </h2>
                      
                      {getPlansForDay(selectedDayIndex).length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No attractions selected</p>
                          <p className="text-sm mt-1">Add attractions for each time slot</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {timeSlots.map(slot => {
                            const key = `${selectedDayIndex}-${slot}`;
                            const place = dayPlans[key];
                            
                            return (
                              <div key={slot} className="border-b border-gray-200 pb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-semibold text-gray-700 capitalize">
                                    {slot}
                                  </span>
                                </div>
                                
                                {place ? (
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 relative">
                                    <button
                                      onClick={() => {
                                        const newPlans = { ...dayPlans };
                                        delete newPlans[key];
                                        setDayPlans(newPlans);
                                      }}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                    
                                    <h3 className="font-bold text-gray-900 text-sm pr-6">
                                      {place.place_name}
                                    </h3>
                                    {place.duration_hours && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {formatTime(place.duration_hours)}
                                      </p>
                                    )}
                                    {place.price > 0 && (
                                      <p className="text-xs text-green-600 font-semibold mt-1">
                                        ${place.price}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No attraction selected</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 2: Hotel Selection */}
        {currentStep === 2 && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Select Hotels for Each Day
              </h1>
              <p className="text-gray-600">
                Choose accommodation for each night of your stay
              </p>
            </div>

            {hotels.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-gray-500">No hotels available for this destination</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from({ length: tripDays }).map((_, dayIndex) => (
                  <div key={dayIndex} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        Day {dayIndex + 1} - Select Hotel
                      </h2>
                      {selectedHotels[dayIndex] && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Hotel Selected
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {hotels.map((hotel) => {
                        const isSelected = selectedHotels[dayIndex]?._id === hotel._id;
                        
                        return (
                          <div
                            key={hotel._id}
                            className={`border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                            onClick={() => handleSelectHotel(dayIndex, hotel)}
                          >
                            <img
                              src={hotel.image || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                              alt={hotel.name}
                              className="w-full h-40 object-cover"
                            />
                            
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-gray-900 text-sm">{hotel.name}</h3>
                                {hotel.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium">{hotel.rating}</span>
                                  </div>
                                )}
                              </div>
                              
                              {hotel.location && (
                                <p className="text-xs text-gray-600 mb-3">
                                  {hotel.location}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xl font-bold text-blue-600">
                                  ${hotel.pricePerNight}
                                </span>
                                <span className="text-xs text-gray-500">per night</span>
                              </div>
                              
                              {hotel.amenities && hotel.amenities.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 3: Car Rental */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Do You Need a Car?
            </h1>
            <p className="text-gray-600 mb-6">
              Rent a vehicle for your entire trip duration ({tripDays} days)
            </p>

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setNeedCarRental(true)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  needCarRental
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Yes, I need a car
              </button>
              <button
                onClick={() => {
                  setNeedCarRental(false);
                  setSelectedCar(null);
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  !needCarRental
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No, thanks
              </button>
            </div>

            {needCarRental && (
              <>
                {cars.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No car rentals available for this destination</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cars.map((car) => {
                      const isSelected = selectedCar?._id === car._id;
                      const totalPrice = car.pricePerDay * tripDays;
                      
                      return (
                        <div
                          key={car._id}
                          className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 shadow-lg bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => handleSelectCar(car)}
                        >
                          <div className="flex items-center justify-center mb-4">
                            <Car className="w-16 h-16 text-blue-600" />
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            {car.type || car.name}
                          </h3>
                          
                          <div className="text-center mb-4">
                            {car.capacity && (
                              <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                                <User className="w-4 h-4" />
                                <span className="text-sm">Up to {car.capacity} passengers</span>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-600 mb-2">
                              ${car.pricePerDay}/day
                            </div>
                            
                            <div className="text-2xl font-bold text-blue-600">
                              ${totalPrice}
                            </div>
                            <div className="text-xs text-gray-500">
                              for {tripDays} days
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Review Your Booking
              </h1>
              <p className="text-gray-600">
                Please review all details before confirming
              </p>
            </div>

            {/* Trip Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-semibold text-gray-900">{destinationName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Travel Dates</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{tripDays} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-semibold text-gray-900">{guests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Day-wise Itinerary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Itinerary</h2>
              <div className="space-y-4">
                {Array.from({ length: tripDays }).map((_, dayIndex) => (
                  <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Day {dayIndex + 1}</h3>
                    
                    {/* Time Slot Attractions */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Attractions:</p>
                      <div className="space-y-2">
                        {timeSlots.map(slot => {
                          const key = `${dayIndex}-${slot}`;
                          const place = dayPlans[key];
                          
                          if (!place) return null;
                          
                          return (
                            <div key={slot} className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                              <div className="bg-blue-600 text-white rounded-full px-2 py-1 text-xs font-bold capitalize min-w-fit">
                                {slot}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{place.place_name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  {place.duration_hours && (
                                    <span className="text-xs text-gray-600">
                                      {formatTime(place.duration_hours)}
                                    </span>
                                  )}
                                  {place.price > 0 && (
                                    <span className="text-xs text-green-600 font-semibold">
                                      ${place.price}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Hotel */}
                    {selectedHotels[dayIndex] && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Hotel:</p>
                        <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <HotelIcon className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">{selectedHotels[dayIndex].name}</p>
                              {selectedHotels[dayIndex].location && (
                                <p className="text-xs text-gray-600">{selectedHotels[dayIndex].location}</p>
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-green-600">${selectedHotels[dayIndex].pricePerNight}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Car Rental Summary */}
            {needCarRental && selectedCar && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Car Rental</h2>
                <div className="flex items-center justify-between bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Car className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-bold text-gray-900">{selectedCar.type || selectedCar.name}</p>
                      <p className="text-sm text-gray-600">
                        ${selectedCar.pricePerDay}/day × {tripDays} days
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">${totalCarCost}</p>
                </div>
              </div>
            )}

            {/* Cost Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cost Breakdown</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Hotels ({tripDays} nights)</span>
                  <span className="font-semibold text-gray-900">${totalHotelCost}</span>
                </div>
                {needCarRental && selectedCar && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Car Rental ({tripDays} days)</span>
                    <span className="font-semibold text-gray-900">${totalCarCost}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 bg-blue-50 rounded-lg px-4">
                  <span className="text-lg font-bold text-gray-900">Total Cost</span>
                  <span className="text-2xl font-bold text-blue-600">${totalCost}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleConfirmBooking}
                className="ml-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Confirm Booking
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {detailsModalPlace && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {detailsModalPlace.place_name}
                </h2>
                <button
                  onClick={() => setDetailsModalPlace(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6">
                <img
                  src={detailsModalPlace.image_url || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'}
                  alt={detailsModalPlace.place_name}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {detailsModalPlace.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <div>
                        <p className="text-xs text-gray-600">Rating</p>
                        <p className="font-semibold text-gray-900">
                          {detailsModalPlace.rating.toFixed(1)} / 5.0
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {detailsModalPlace.time_slot && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Time Slot</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {detailsModalPlace.time_slot}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {detailsModalPlace.duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {formatTime(detailsModalPlace.duration_hours)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {detailsModalPlace.price > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 text-green-600 font-bold text-lg">$</div>
                      <div>
                        <p className="text-xs text-gray-600">Entry Fee</p>
                        <p className="font-semibold text-green-600">
                          ${detailsModalPlace.price}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {detailsModalPlace.category && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {detailsModalPlace.category}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {detailsModalPlace.best_season && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600">Best Season</p>
                        <p className="font-semibold text-gray-900">
                          {detailsModalPlace.best_season}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {detailsModalPlace.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {detailsModalPlace.description}
                    </p>
                  </div>
                )}
                
                {detailsModalPlace.location && detailsModalPlace.location.lat && detailsModalPlace.location.lng && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Location</h3>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <p>
                        Lat: {detailsModalPlace.location.lat.toFixed(6)}, 
                        Lng: {detailsModalPlace.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
                
                {detailsModalPlace.is_popular && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    <p className="text-yellow-800 font-semibold">
                      This is a popular attraction among travelers!
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    handleAddAttraction(detailsModalPlace);
                    setDetailsModalPlace(null);
                  }}
                  className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition-all ${
                    isAttractionSelected(detailsModalPlace._id)
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isAttractionSelected(detailsModalPlace._id) ? 'Remove from Plan' : 'Add to Plan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600 mb-4">
                Your trip to {destinationName} has been successfully booked
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-700">
                  <strong>Total Cost:</strong> ${totalCost}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Duration:</strong> {tripDays} days
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Guests:</strong> {guests}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}