import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles, 
  Download, 
  Share2,
  CheckCircle,
  Camera,
  Utensils,
  Loader2,
  AlertCircle,
  Clock,
  Hotel,
  Car
} from 'lucide-react';

interface ItineraryProps {
  onNavigate?: (page: string, data?: any) => void;
}

interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'activity' | 'meal';
  cost?: number;
  location?: string;
}

interface Destination {
  _id: string;
  name: string;
  description?: string;
}

interface Hotel {
  _id: string;
  name: string;
  perDay: number;
  description?: string;
}

interface CarRental {
  _id: string;
  model: string;
  providerContact: string;
  perDay: number;
}

interface TripPlan {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  preferences: string[];
  itinerary: { [key: string]: ItineraryItem[] };
  totalCost: number;
  days?: number;
  destinationId: string;
  selectedHotel?: Hotel | null;
  selectedCar?: CarRental | null;
}

const BASE_URL = import.meta.env.VITE_BASE_URL;
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL;


export function Itinerary({ onNavigate }: ItineraryProps) {
  const [currentStep, setCurrentStep] = useState('preferences');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 25000,
    travelers: 2,
    preferences: [],
    itinerary: {},
    totalCost: 0,
    destinationId: '',
    selectedHotel: null,
    selectedCar: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // API data states
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cars, setCars] = useState<CarRental[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingCars, setLoadingCars] = useState(false);

  const travelPreferences = [
    'Adventure', 'Culture', 'Relaxation', 'Food & Dining', 'Nature', 'Shopping',
    'History', 'Photography', 'Nightlife', 'Beach', 'Mountains', 'City Life'
  ];

  const activityTypes = {
    activity: { icon: <Camera className="h-4 w-4" />, color: '#f59e0b' },
    meal: { icon: <Utensils className="h-4 w-4" />, color: '#ef4444' }
  };

  // Fetch destinations on mount
  useEffect(() => {
    fetchDestinations();
  }, []);

  // Fetch hotels and cars when destination changes
  useEffect(() => {
    if (tripPlan.destinationId && currentStep === 'itinerary') {
      fetchHotelsAndCars(tripPlan.destinationId);
    }
  }, [tripPlan.destinationId, currentStep]);

  const fetchDestinations = async () => {
    try {
      setLoadingDestinations(true);
      const response = await fetch(`${BASE_URL}/destinations`);
      if (!response.ok) throw new Error('Failed to fetch destinations');
      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations');
    } finally {
      setLoadingDestinations(false);
    }
  };

  const fetchHotelsAndCars = async (destinationId: string) => {
    // Fetch hotels
    setLoadingHotels(true);
    try {
      const hotelsResponse = await fetch(`${BASE_URL}/hotels/destination/${destinationId}`);
      if (hotelsResponse.ok) {
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
      } else {
        setHotels([]);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setHotels([]);
    } finally {
      setLoadingHotels(false);
    }

    // Fetch cars
    setLoadingCars(true);
    try {
      const carsResponse = await fetch(`${BASE_URL}/cars/destination/${destinationId}`);
      if (carsResponse.ok) {
        const carsData = await carsResponse.json();
        setCars(carsData);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleDestinationChange = (destinationId: string) => {
    const selectedDest = destinations.find(d => d._id === destinationId);
    setTripPlan(prev => ({
      ...prev,
      destinationId,
      destination: selectedDest?.name || '',
      selectedHotel: null,
      selectedCar: null
    }));
    setHotels([]);
    setCars([]);
  };

  const handlePreferenceToggle = (preference: string) => {
    setTripPlan(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  const convertAPIResponseToItinerary = (apiData: any) => {
    const itinerary: { [key: string]: ItineraryItem[] } = {};
    const timeSlotMap: { [key: string]: string } = {
      'morning': '09:00 AM',
      'afternoon': '02:00 PM',
      'evening': '06:00 PM'
    };
    
    // Process each day in the plan
    apiData.plan.forEach((dayPlan: any) => {
      const date = dayPlan.date;
      const dayActivities: ItineraryItem[] = [];
      
      // Process places for each time slot
      dayPlan.places.forEach((place: any) => {
        if (place.placeId && place.place !== 'No available place' && place.place !== 'Free time / Explore local areas') {
          dayActivities.push({
            id: place.placeId,
            time: timeSlotMap[place.timeSlot] || '09:00 AM',
            title: place.place,
            description: `Explore ${place.place} during ${place.timeSlot}`,
            type: 'activity',
            cost: place.price || 0,
            location: tripPlan.destination
          });
        } else if (place.place === 'Free time / Explore local areas') {
          dayActivities.push({
            id: `68f7496d06cf8e01cac5239b`,
            time: timeSlotMap[place.timeSlot] || '09:00 AM',
            title: 'Free Time & Exploration',
            description: 'Explore local areas and enjoy at your leisure',
            type: 'activity',
            cost: 0,
            location: tripPlan.destination
          });
        }
      });
      
      // Add lunch after morning activities
      dayActivities.push({
        id: `68f7496d06cf8e01cac5239b`,
        time: '12:30 PM',
        title: 'Local Lunch',
        description: 'Enjoy authentic local cuisine',
        type: 'meal',
        cost: Math.round((apiData.estimatedCost / apiData.plan.length / tripPlan.travelers) * 0.15),
        location: tripPlan.destination
      });
      
      // Add dinner at the end of the day
      dayActivities.push({
        id: `68f7496d06cf8e01cac5239b`,
        time: '08:00 PM',
        title: 'Dinner Experience',
        description: 'Savor local specialties and regional dishes',
        type: 'meal',
        cost: Math.round((apiData.estimatedCost / apiData.plan.length / tripPlan.travelers) * 0.2),
        location: tripPlan.destination
      });
      
      // Sort activities by time
      itinerary[date] = dayActivities.sort((a, b) => {
        const timeA = parseInt(a.time.replace(/[^0-9]/g, ''));
        const timeB = parseInt(b.time.replace(/[^0-9]/g, ''));
        return timeA - timeB;
      });
    });
    
    // Calculate total days
    const days = apiData.plan.length;
    
    // Get destination name from the selected destination
    const selectedDest = destinations.find(d => d._id === tripPlan.destinationId);
    
    setTripPlan(prev => ({
      ...prev,
      destination: selectedDest?.name || prev.destination,
      itinerary,
      totalCost: Math.round(apiData.estimatedCost),
      days: days
    }));
  };

  const generateAITripPlan = async () => {
    setIsGenerating(true);
    setError('');

    if (!tripPlan.destinationId || !tripPlan.startDate || !tripPlan.endDate) {
      setError('Please fill in all required fields');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(`${AI_BASE_URL}/generate_trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_id: tripPlan.destinationId,
          budget: tripPlan.budget,
          start_date: tripPlan.startDate,
          end_date: tripPlan.endDate,
          travelers: tripPlan.travelers,
          preferences: tripPlan.preferences.map(p => 
            p.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
          )
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate trip plan');
      }

      const data = await response.json();
      convertAPIResponseToItinerary(data);
      setCurrentStep('itinerary');
      setSuccess('Trip plan generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error generating trip plan:', error);
      setError(error.message || 'Failed to generate AI trip plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setError('');

    try {
      const customPlan: any[] = [];
      
      Object.entries(tripPlan.itinerary).forEach(([date, activities]) => {
        const dayPlan: any = { date, places: [] };
        
        if (tripPlan.selectedHotel) {
          dayPlan.Hotel = {
            id: tripPlan.selectedHotel._id,
            name: tripPlan.selectedHotel.name,
            perDay: tripPlan.selectedHotel.perDay
          };
        }
        
        activities.forEach((activity) => {
          if (activity.type === 'activity') {
            // Map time to time slot
            let timeSlot = 'morning';
            const hour = parseInt(activity.time.replace(/[^0-9]/g, '').substring(0, 2));
            
            if (hour >= 12 && hour < 16) {
              timeSlot = 'afternoon';
            } else if (hour >= 16) {
              timeSlot = 'evening';
            }
            
            dayPlan.places.push({
              placeId: activity.id,
              place: activity.title,
              price: activity.cost || 0,
              timeSlot: timeSlot
            });
          }
        });
        
        customPlan.push(dayPlan);
      });

      let totalCost = tripPlan.totalCost;
      const days = Object.keys(tripPlan.itinerary).length;
      
      if (tripPlan.selectedHotel) {
        totalCost += tripPlan.selectedHotel.perDay * days;
      }
      
      if (tripPlan.selectedCar) {
        totalCost += tripPlan.selectedCar.perDay * days;
      }

      const bookingData: any = {
        destinationId: tripPlan.destinationId,
        startDate: tripPlan.startDate,
        endDate: tripPlan.endDate,
        guests: tripPlan.travelers,
        customPlan: customPlan,
        totalCost: Math.round(totalCost)
      };

      if (tripPlan.selectedCar) {
        bookingData.carRental = {
          carId: tripPlan.selectedCar._id,
          model: tripPlan.selectedCar.model,
          providerContact: tripPlan.selectedCar.providerContact,
          perDay: tripPlan.selectedCar.perDay
        };
      }

      console.log("Booking Payload:", JSON.stringify(bookingData, null, 2));

      const token = typeof window !== 'undefined' ? window.localStorage?.getItem('authToken') : null;
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

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
      setBookingDetails(result);
      setSuccess('🎉 Booking confirmed successfully!');
      setShowBookingModal(true);
      
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('bookings', result);
        }
      }, 3000);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError('Failed to create booking: ' + err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const getTotalCostBreakdown = () => {
    let activities = 0;
    let meals = 0;
    
    Object.values(tripPlan.itinerary).forEach(dayActivities => {
      dayActivities.forEach(activity => {
        if (activity.type === 'activity' && activity.cost) {
          activities += activity.cost;
        } else if (activity.type === 'meal' && activity.cost) {
          meals += activity.cost;
        }
      });
    });
    
    return { activities, meals, total: activities + meals };
  };

  const calculateFinalTotal = () => {
    let total = tripPlan.totalCost;
    const days = tripPlan.days || 1;
    
    if (tripPlan.selectedHotel) {
      total += tripPlan.selectedHotel.perDay * days;
    }
    
    if (tripPlan.selectedCar) {
      total += tripPlan.selectedCar.perDay * days;
    }
    
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ✈️ AI-Powered Trip Planning
          </h1>
          <p className="text-xl text-gray-600">
            Create the perfect itinerary tailored to your preferences and budget
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['preferences', 'itinerary'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep === step
                      ? 'bg-blue-500 text-white scale-110'
                      : index < ['preferences', 'itinerary'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < ['preferences', 'itinerary'].indexOf(currentStep) ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                  {step}
                </span>
                {index < 1 && <div className="w-16 h-1 bg-gray-200 ml-4 rounded" />}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-6">
          {/* Preferences Step */}
          <TabsContent value="preferences">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Sparkles className="h-6 w-6" />
                  <span>Tell us about your dream trip</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="destination" className="text-base font-semibold">Destination *</Label>
                    <Select 
                      value={tripPlan.destinationId} 
                      onValueChange={handleDestinationChange}
                      disabled={loadingDestinations}
                    >
                      <SelectTrigger className="h-12 mt-2">
                        <SelectValue placeholder={loadingDestinations ? "Loading destinations..." : "Select a destination"} />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((dest) => (
                          <SelectItem key={dest._id} value={dest._id}>
                            {dest.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget" className="text-base font-semibold">Budget (₹)</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="25000"
                        value={tripPlan.budget}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="startDate" className="text-base font-semibold">Start Date *</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="startDate"
                        type="date"
                        value={tripPlan.startDate}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, startDate: e.target.value }))}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-base font-semibold">End Date *</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="endDate"
                        type="date"
                        value={tripPlan.endDate}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, endDate: e.target.value }))}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="travelers" className="text-base font-semibold">Number of Travelers</Label>
                    <Select 
                      value={tripPlan.travelers.toString()} 
                      onValueChange={(value) => setTripPlan(prev => ({ ...prev, travelers: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-12 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Traveler</SelectItem>
                        <SelectItem value="2">2 Travelers</SelectItem>
                        <SelectItem value="3">3 Travelers</SelectItem>
                        <SelectItem value="4">4 Travelers</SelectItem>
                        <SelectItem value="5">5+ Travelers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Travel Preferences</Label>
                  <p className="text-sm text-gray-600 mb-3">Select all that apply to personalize your experience</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {travelPreferences.map((preference) => (
                      <button
                        key={preference}
                        onClick={() => handlePreferenceToggle(preference)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          tripPlan.preferences.includes(preference)
                            ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {preference}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={generateAITripPlan}
                    disabled={isGenerating || !tripPlan.destinationId || !tripPlan.startDate || !tripPlan.endDate}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white h-12 px-8 text-lg hover:from-blue-600 hover:to-purple-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Your Trip Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate AI Trip Plan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Itinerary Step */}
          <TabsContent value="itinerary">
            <div className="space-y-6">
              {/* Trip Overview */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="text-2xl">
                    <MapPin className="h-6 w-6 inline mr-2" />
                    Trip to {tripPlan.destination}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-bold text-lg">{tripPlan.days || 0} days</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600">Travelers</p>
                      <p className="font-bold text-lg">{tripPlan.travelers}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-bold text-lg">₹{tripPlan.budget.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-orange-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <DollarSign className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="text-sm text-gray-600">Est. Cost</p>
                      <p className="font-bold text-lg">₹{calculateFinalTotal().toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Itinerary */}
              {Object.keys(tripPlan.itinerary).length > 0 ? (
                <>
                  <div className="space-y-4">
                    {Object.entries(tripPlan.itinerary).map(([date, activities]) => (
                      <Card key={date} className="shadow-md border-l-4 border-l-blue-500">
                        <CardHeader className="bg-gray-50">
                          <CardTitle className="text-xl text-blue-600">
                            📅 {formatDate(date)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {activities.map((activity) => (
                              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50">
                                <div 
                                  className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                  style={{ backgroundColor: activityTypes[activity.type].color }}
                                >
                                  {activityTypes[activity.type].icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-bold text-lg text-gray-900">{activity.title}</h4>
                                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                      <Badge variant="outline" className="text-xs font-semibold">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {activity.time}
                                      </Badge>
                                      {activity.cost && activity.cost > 0 && (
                                        <Badge className="text-xs bg-green-500 text-white">
                                          ₹{activity.cost}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Hotel and Car Selection */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <CardTitle className="text-xl">🏨 Additional Services (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Hotel Selection */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Select Hotel (Optional)</Label>
                        {loadingHotels ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-3 text-gray-600">Loading hotels...</span>
                          </div>
                        ) : hotels.length === 0 ? (
                          <Alert className="border-gray-200">
                            <AlertDescription className="text-gray-600">
                              No hotels available for this destination
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => setTripPlan(prev => ({ ...prev, selectedHotel: null }))}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                !tripPlan.selectedHotel
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="font-semibold text-gray-900">No Hotel</div>
                              <div className="text-sm text-gray-600">I'll arrange my own accommodation</div>
                            </button>
                            {hotels.map((hotel) => (
                              <button
                                key={hotel._id}
                                onClick={() => setTripPlan(prev => ({ ...prev, selectedHotel: hotel }))}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${
                                  tripPlan.selectedHotel?._id === hotel._id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-semibold text-gray-900">{hotel.name}</div>
                                  <Badge className="bg-green-500 text-white">₹{hotel.perDay}/day</Badge>
                                </div>
                                {hotel.description && (
                                  <div className="text-sm text-gray-600">{hotel.description}</div>
                                )}
                                <div className="text-xs text-gray-500 mt-2">
                                  Total: ₹{(hotel.perDay * (tripPlan.days || 1)).toLocaleString()} for {tripPlan.days || 1} days
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Car Rental Selection */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Select Car Rental (Optional)</Label>
                        {loadingCars ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="ml-3 text-gray-600">Loading cars...</span>
                          </div>
                        ) : cars.length === 0 ? (
                          <Alert className="border-gray-200">
                            <AlertDescription className="text-gray-600">
                              No car rentals available for this destination
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => setTripPlan(prev => ({ ...prev, selectedCar: null }))}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                !tripPlan.selectedCar
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="font-semibold text-gray-900">No Car Rental</div>
                              <div className="text-sm text-gray-600">I'll use public transport or other options</div>
                            </button>
                            {cars.map((car) => (
                              <button
                                key={car._id}
                                onClick={() => setTripPlan(prev => ({ ...prev, selectedCar: car }))}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${
                                  tripPlan.selectedCar?._id === car._id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-semibold text-gray-900">{car.model}</div>
                                  <Badge className="bg-blue-500 text-white">₹{car.perDay}/day</Badge>
                                </div>
                                <div className="text-sm text-gray-600">Contact: {car.providerContact}</div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Total: ₹{(car.perDay * (tripPlan.days || 1)).toLocaleString()} for {tripPlan.days || 1} days
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cost Summary with Services */}
                      {(tripPlan.selectedHotel || tripPlan.selectedCar) && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-2 border-2 border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Additional Services Cost</h4>
                          {tripPlan.selectedHotel && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Hotel ({tripPlan.selectedHotel.name}):</span>
                              <span className="font-semibold">₹{(tripPlan.selectedHotel.perDay * (tripPlan.days || 1)).toLocaleString()}</span>
                            </div>
                          )}
                          {tripPlan.selectedCar && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Car Rental ({tripPlan.selectedCar.model}):</span>
                              <span className="font-semibold">₹{(tripPlan.selectedCar.perDay * (tripPlan.days || 1)).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t-2 border-gray-300 pt-2 flex justify-between font-bold">
                            <span className="text-gray-900">New Total Cost:</span>
                            <span className="text-purple-600 text-lg">
                              ₹{calculateFinalTotal().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('preferences')}
                      className="h-12 px-6"
                    >
                      ← Back to Preferences
                    </Button>
                    <Button
                      onClick={handleConfirmBooking}
                      disabled={isBooking}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white h-12 px-8 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        'Confirm Booking →'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="shadow-md">
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <MapPin className="h-16 w-16 mx-auto mb-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Itinerary Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Go back to preferences and generate your AI trip plan
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('preferences')}
                    >
                      Go to Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Confirmation Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                  <CheckCircle className="h-8 w-8" />
                  <span>Booking Confirmed!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center space-y-4">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-900">
                  Your trip to {tripPlan.destination} is booked!
                </h3>
                <p className="text-gray-600">
                  Get ready for an amazing {tripPlan.days}-day adventure!
                </p>
                
                {bookingDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-semibold">{bookingDetails._id || bookingDetails.id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-semibold">{tripPlan.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dates:</span>
                      <span className="font-semibold text-sm">
                        {new Date(tripPlan.startDate).toLocaleDateString()} - {new Date(tripPlan.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Travelers:</span>
                      <span className="font-semibold">{tripPlan.travelers} {tripPlan.travelers === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-semibold text-green-600">₹{calculateFinalTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => {
                      setShowBookingModal(false);
                      if (onNavigate) {
                        onNavigate('bookings', bookingDetails);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  >
                    View My Bookings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingModal(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}