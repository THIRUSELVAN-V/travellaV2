import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DestinationCard } from './DestinationCard';
import { Search, Sparkles, TrendingUp, Award, MapPin, Users, Calendar, DollarSign } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';


interface HomeProps {
  onNavigate: (page: string) => void;
}

const BASE_URL = import.meta.env.VITE_BASE_URL;



export function Home({ onNavigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularDestinations, setPopularDestinations] = useState<any[]>([]);

  // Fetch destinations from backend
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/destinations`);
        const data = await response.json();
        setPopularDestinations(data);
      } catch (error) {
        console.error('Error fetching destination data:', error);
      }
    };
    fetchDestinations();
  }, []);

  const featuredTrips = [
    {
      name: "Luxury Cruise Experience",
      location: "Mediterranean Sea",
      image: "https://images.unsplash.com/photo-1746900830074-baf6ddf20bca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      rating: 4.7,
      duration: "14 days",
      price: "$3,899",
      description: "All-inclusive luxury cruise visiting multiple Mediterranean ports including Rome, Barcelona, and Greek islands with world-class amenities.",
      tags: ["Cruise", "Luxury", "All-inclusive", "Multiple Cities"]
    }
  ];

  const aiFeatures = [
    {
      icon: <Sparkles className="h-8 w-8" style={{ color: '#36bcf8' }} />,
      title: "AI Trip Planning",
      description: "Get personalized recommendations based on your preferences, budget, and travel style."
    },
    {
      icon: <TrendingUp className="h-8 w-8" style={{ color: '#36bcf8' }} />,
      title: "Smart Budgeting",
      description: "Machine learning algorithms predict and optimize your travel expenses for better value."
    },
    {
      icon: <MapPin className="h-8 w-8" style={{ color: '#36bcf8' }} />,
      title: "Route Optimization",
      description: "AI-powered itinerary generation creates the most efficient travel routes and schedules."
    },
    {
      icon: <Users className="h-8 w-8" style={{ color: '#36bcf8' }} />,
      title: "Group Planning",
      description: "Collaborative tools for planning trips with friends and family in real-time."
    }
  ];

  const stats = [
    { label: "Happy Travelers", value: "50K+", icon: <Users className="h-6 w-6" /> },
    { label: "Destinations", value: "200+", icon: <MapPin className="h-6 w-6" /> },
    { label: "Trip Plans Created", value: "25K+", icon: <Calendar className="h-6 w-6" /> },
    { label: "Money Saved", value: "$2M+", icon: <DollarSign className="h-6 w-6" /> }
  ];

  const filteredDestinations = popularDestinations;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI-Powered Travel Planning
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover amazing destinations with intelligent trip planning and seamless booking
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-8 text-lg font-semibold"
                style={{ backgroundColor: '#36bcf8' }}
                onClick={() => onNavigate('itinerary')}
              >
                <Search className="h-5 w-5 mr-2" />
                Plan Trip
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                <div style={{ color: '#36bcf8' }}>{stat.icon}</div>
                <span className="font-semibold">{stat.value}</span>
                <span className="text-blue-100">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Intelligent Travel Assistant
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Experience the future of travel planning with our AI-powered platform that understands your preferences and creates perfect itineraries.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section (fetched from API) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Popular Destinations
              </h2>
              <p className="text-xl text-gray-600">Explore trending spots across the globe</p>
            </div>
            <Button
              variant="outline"
              className="border-2"
              style={{ borderColor: '#36bcf8', color: '#36bcf8' }}
              onClick={() => onNavigate('booking')}
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination, index) => (
                <DestinationCard
                  key={index}
                  name={destination.name}
                  location={destination.country}
                  description={destination.description}
                  image={destination.images[0] || 'https://via.placeholder.com/400'}
                  rating={4.8}
                  duration="5 days"
                  price="$1,299"
                  tags={destination.tags || []}
                  onClick={() => onNavigate('booking')}
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center">No destinations found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Trips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Experiences
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Curated premium experiences for unforgettable journeys
          </p>
          {featuredTrips.map((trip, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <ImageWithFallback
                    src={trip.image}
                    alt={trip.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <Award className="h-6 w-6 mr-2" style={{ color: '#36bcf8' }} />
                    <span className="text-sm font-medium" style={{ color: '#36bcf8' }}>
                      FEATURED EXPERIENCE
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{trip.location}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{trip.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold" style={{ color: '#36bcf8' }}>
                      {trip.price}
                    </div>
                    <Button
                      className="text-white"
                      style={{ backgroundColor: '#36bcf8' }}
                      onClick={() => onNavigate('booking')}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: '#36bcf8' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who trust our AI-powered platform for their perfect trips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-lg font-semibold bg-white text-gray-900 border-white hover:bg-gray-50"
              onClick={() => onNavigate('chat')}
            >
              Chat with AI Assistant
            </Button>
            <Button
              size="lg"
              className="h-12 px-8 text-lg font-semibold bg-white text-gray-900 hover:bg-gray-50"
              onClick={() => onNavigate('itinerary')}
            >
              Create Itinerary
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
