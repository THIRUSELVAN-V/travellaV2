import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Star, Wifi, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookingDetailsProps {
  onNavigate: (page: string) => void;
}

interface HotelDetails {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  price: number;
  amenities?: string[];
  description?: string;
}

export function BookingDetails({ onNavigate }: BookingDetailsProps) {
  const [hotel, setHotel] = useState<HotelDetails | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('selectedHotel');
      if (stored) {
        setHotel(JSON.parse(stored));
      }
    } catch {
      setHotel(null);
    }
  }, []);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={() => onNavigate('booking')} className="mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booking
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">No hotel selected</h1>
          </div>
          <p className="text-gray-600">Please choose a hotel from the booking page to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => onNavigate('booking')} className="mr-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hotel Details</h1>
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-full">
              <ImageWithFallback
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{hotel.name}</div>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{hotel.location}</span>
                    </div>
                  </div>
                  <Badge className="bg-white text-gray-900">${hotel.price}/night</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{hotel.rating}</span>
                </div>

                {hotel.description && (
                  <p className="text-gray-700 mb-4">{hotel.description}</p>
                )}

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Amenities</h3>
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
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    className="text-white"
                    style={{ backgroundColor: '#36bcf8' }}
                    onClick={() => onNavigate('booking')}
                  >
                    Choose Room
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2"
                    style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
                    onClick={() => onNavigate('home')}
                  >
                    Explore More
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


