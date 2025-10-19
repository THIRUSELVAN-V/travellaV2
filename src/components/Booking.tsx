import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Car, 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Wifi, 
  Car as CarIcon,
  Fuel,
  Settings,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BookingProps {
  onNavigate: (page: string) => void;
}

export function Booking({ onNavigate }: BookingProps) {
  const [activeTab, setActiveTab] = useState('hotels');
  const [user, setUser] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
    carType: 'economy',
    hotelType: 'any'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [error, setError] = useState('');

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  const hotels = [
    {
      id: 1,
      name: "Luxury Beach Resort",
      location: "Maldives",
      image: "https://images.unsplash.com/photo-1607712617949-8c993d290809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzU3OTMzOTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.9,
      price: 350,
      amenities: ["Wifi", "Pool", "Spa", "Beach Access"],
      description: "Stunning overwater bungalows with crystal clear lagoon views"
    },
    {
      id: 2,
      name: "Mountain Lodge",
      location: "Swiss Alps",
      image: "https://images.unsplash.com/photo-1647291718042-676c0428fc25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHRyYXZlbHxlbnwxfHx8fDE3NTgwMTk4ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.7,
      price: 280,
      amenities: ["Wifi", "Fireplace", "Ski Access", "Restaurant"],
      description: "Cozy alpine retreat with breathtaking mountain panoramas"
    },
    {
      id: 3,
      name: "City Center Hotel",
      location: "New York City",
      image: "https://images.unsplash.com/photo-1742516014153-6cae2ae4a6a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHRyYXZlbHxlbnwxfHx8fDE3NTc5ODEyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      rating: 4.5,
      price: 220,
      amenities: ["Wifi", "Gym", "Business Center", "Concierge"],
      description: "Modern hotel in the heart of Manhattan with skyline views"
    }
  ];

  const vehicles = [
    {
      id: 1,
      name: "Economy Sedan",
      type: "economy",
      image: "https://images.unsplash.com/photo-1675024281913-f1e53966b136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBjYXIlMjByZW50YWx8ZW58MXx8fHwxNzU4MDMwMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 45,
      features: ["5 Seats", "Automatic", "AC", "Bluetooth"],
      fuelType: "Petrol",
      description: "Perfect for city driving and short trips"
    },
    {
      id: 2,
      name: "SUV Adventure",
      type: "suv",
      image: "https://images.unsplash.com/photo-1675024281913-f1e53966b136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBjYXIlMjByZW50YWx8ZW58MXx8fHwxNzU4MDMwMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 85,
      features: ["7 Seats", "4WD", "AC", "GPS"],
      fuelType: "Diesel",
      description: "Spacious and powerful for family adventures"
    },
    {
      id: 3,
      name: "Luxury Sedan",
      type: "luxury",
      image: "https://images.unsplash.com/photo-1675024281913-f1e53966b136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBjYXIlMjByZW50YWx8ZW58MXx8fHwxNzU4MDMwMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 120,
      features: ["5 Seats", "Leather", "Premium Audio", "Sunroof"],
      fuelType: "Hybrid",
      description: "Premium comfort and style for special occasions"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBooking = async (type: 'hotel' | 'vehicle', item: any) => {
    setIsLoading(true);
    setError('');

    try {
      // Save context and navigate to booking process page
      try {
        localStorage.setItem('bookingItemType', type);
        localStorage.setItem('bookingItem', JSON.stringify(item));
        localStorage.setItem('bookingData', JSON.stringify(bookingData));
      } catch {}
      onNavigate('bookingProcess');
    } catch (error) {
      console.error('Booking navigation error:', error);
      setError('Unable to start booking process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book Your Perfect Trip
          </h1>
          <p className="text-xl text-gray-600">
            Find and book hotels, rental cars, and more with our AI-powered recommendations
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="destination">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="destination"
                    placeholder="Where to?"
                    value={bookingData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="checkin">Check-in</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="checkin"
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="checkout">Check-out</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="checkout"
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="guests">Guests</Label>
                <Select value={bookingData.guests} onValueChange={(value) => handleInputChange('guests', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5+">5+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  className="w-full text-white"
                  style={{ backgroundColor: '#36bcf8' }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {bookingSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{bookingSuccess}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Booking Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hotels" className="flex items-center space-x-2">
              <Hotel className="h-4 w-4" />
              <span>Hotels</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>Rental Cars</span>
            </TabsTrigger>
          </TabsList>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Available Hotels</h2>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-gray-900">
                        ${hotel.price}/night
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{hotel.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{hotel.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">{hotel.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{hotel.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: '#e0f7ff', color: '#36bcf8' }}
                          >
                            {amenity === 'Wifi' && <Wifi className="h-3 w-3 mr-1" />}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button 
                          variant="outline"
                          className="border-2"
                          style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                          onClick={() => {
                            try {
                              localStorage.setItem('selectedHotel', JSON.stringify(hotel));
                            } catch {}
                            onNavigate('bookingDetails');
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          className="text-white"
                          style={{ backgroundColor: '#36bcf8' }}
                          onClick={() => handleBooking('hotel', hotel)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Booking...' : `Book Now - $${hotel.price}/night`}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Rental Cars</h2>
              <div className="flex items-center space-x-4">
                <Select value={bookingData.carType} onValueChange={(value) => handleInputChange('carType', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles
                .filter(vehicle => bookingData.carType === 'any' || vehicle.type === bookingData.carType)
                .map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-gray-900">
                        ${vehicle.price}/day
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{vehicle.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Fuel className="h-4 w-4 mr-1" />
                          <span>{vehicle.fuelType}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{vehicle.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.map((feature, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: '#e0f7ff', color: '#36bcf8' }}
                          >
                            {feature === 'AC' && <Settings className="h-3 w-3 mr-1" />}
                            {feature.includes('Seats') && <Users className="h-3 w-3 mr-1" />}
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full text-white"
                        style={{ backgroundColor: '#36bcf8' }}
                        onClick={() => handleBooking('vehicle', vehicle)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Booking...' : `Rent Now - $${vehicle.price}/day`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#36bcf8' }}>
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span>Personalized Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Smart Savings Tip</h4>
                <p className="text-gray-600 text-sm">
                  Book your hotel and car together to save up to 15% on your total booking. Our AI detected better rates for combined bookings in your selected destination.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Weather-Based Recommendation</h4>
                <p className="text-gray-600 text-sm">
                  Based on weather forecasts, we recommend booking the SUV Adventure for mountain destinations during winter months for better safety and comfort.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}