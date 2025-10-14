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
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Sparkles, 
  Save, 
  Download, 
  Share2,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Plane,
  Car,
  Hotel,
  Camera,
  Utensils
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ItineraryProps {
  onNavigate: (page: string) => void;
}

interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'flight' | 'hotel' | 'activity' | 'meal' | 'transport';
  cost?: number;
  location?: string;
}

interface TripPlan {
  id?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  preferences: string[];
  itinerary: { [key: string]: ItineraryItem[] };
  totalCost: number;
}

export function Itinerary({ onNavigate }: ItineraryProps) {
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState('preferences');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 2000,
    travelers: 2,
    preferences: [],
    itinerary: {},
    totalCost: 0
  });
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const travelPreferences = [
    'Adventure', 'Culture', 'Relaxation', 'Food & Dining', 'Nature', 'Shopping',
    'History', 'Photography', 'Nightlife', 'Beach', 'Mountains', 'City Life'
  ];

  const activityTypes = {
    flight: { icon: <Plane className="h-4 w-4" />, color: '#36bcf8' },
    hotel: { icon: <Hotel className="h-4 w-4" />, color: '#10b981' },
    activity: { icon: <Camera className="h-4 w-4" />, color: '#f59e0b' },
    meal: { icon: <Utensils className="h-4 w-4" />, color: '#ef4444' },
    transport: { icon: <Car className="h-4 w-4" />, color: '#8b5cf6' }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  const handlePreferenceToggle = (preference: string) => {
    setTripPlan(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a04762c/ai/suggestions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            preferences: tripPlan.preferences,
            budget: tripPlan.budget,
            duration: getDaysBetweenDates(tripPlan.startDate, tripPlan.endDate)
          })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setAiSuggestions(data.suggestions);
        setCurrentStep('suggestions');
      } else {
        setError(data.error || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError('Failed to generate AI suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateItinerary = (selectedDestination?: string) => {
    const destination = selectedDestination || tripPlan.destination;
    const days = getDaysBetweenDates(tripPlan.startDate, tripPlan.endDate);
    const dailyBudget = tripPlan.budget / days;
    
    const mockItinerary: { [key: string]: ItineraryItem[] } = {};
    let totalCost = 0;

    // Generate sample itinerary based on destination and preferences
    for (let i = 0; i < days; i++) {
      const date = new Date(new Date(tripPlan.startDate).getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayActivities: ItineraryItem[] = [];
      let dayCost = 0;

      if (i === 0) {
        // Arrival day
        dayActivities.push({
          id: `${dateKey}-1`,
          time: '10:00',
          title: `Flight to ${destination}`,
          description: 'Departure and arrival at destination',
          type: 'flight',
          cost: Math.round(dailyBudget * 0.4),
          location: destination
        });
        dayCost += dailyBudget * 0.4;
      }

      if (i === days - 1) {
        // Departure day
        dayActivities.push({
          id: `${dateKey}-dep`,
          time: '18:00',
          title: `Flight back home`,
          description: 'Return flight departure',
          type: 'flight',
          cost: 0, // Already counted in arrival
          location: destination
        });
      }

      // Add hotel accommodation
      dayActivities.push({
        id: `${dateKey}-hotel`,
        time: '15:00',
        title: 'Hotel Check-in',
        description: 'Check into your accommodation',
        type: 'hotel',
        cost: Math.round(dailyBudget * 0.3),
        location: destination
      });
      dayCost += dailyBudget * 0.3;

      // Add activities based on preferences
      if (tripPlan.preferences.includes('Culture')) {
        dayActivities.push({
          id: `${dateKey}-culture`,
          time: '14:00',
          title: 'Cultural Site Visit',
          description: 'Explore local museums and historical landmarks',
          type: 'activity',
          cost: Math.round(dailyBudget * 0.15),
          location: destination
        });
        dayCost += dailyBudget * 0.15;
      }

      if (tripPlan.preferences.includes('Food & Dining')) {
        dayActivities.push({
          id: `${dateKey}-dinner`,
          time: '19:00',
          title: 'Local Cuisine Experience',
          description: 'Try authentic local dishes at recommended restaurants',
          type: 'meal',
          cost: Math.round(dailyBudget * 0.15),
          location: destination
        });
        dayCost += dailyBudget * 0.15;
      }

      totalCost += dayCost;
      mockItinerary[dateKey] = dayActivities.sort((a, b) => a.time.localeCompare(b.time));
    }

    setTripPlan(prev => ({
      ...prev,
      destination,
      itinerary: mockItinerary,
      totalCost: Math.round(totalCost)
    }));
    setCurrentStep('itinerary');
  };

  const getDaysBetweenDates = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const saveTripPlan = async () => {
    if (!user) {
      setError('Please login to save your trip plan');
      return;
    }

    try {
      const accessToken = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a04762c/trips`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(tripPlan)
        }
      );

      if (response.ok) {
        setSuccess('Trip plan saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save trip plan');
      }
    } catch (error) {
      console.error('Error saving trip plan:', error);
      setError('Failed to save trip plan');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Trip Planning
          </h1>
          <p className="text-xl text-gray-600">
            Create the perfect itinerary tailored to your preferences and budget
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['preferences', 'suggestions', 'itinerary'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'text-white'
                      : index < ['preferences', 'suggestions', 'itinerary'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  style={{
                    backgroundColor: currentStep === step ? '#36bcf8' : undefined
                  }}
                >
                  {index < ['preferences', 'suggestions', 'itinerary'].indexOf(currentStep) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600 capitalize">
                  {step}
                </span>
                {index < 2 && <div className="w-12 h-0.5 bg-gray-200 ml-4" />}
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
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-6">
          {/* Preferences Step */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#36bcf8' }} />
                  <span>Tell us about your dream trip</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="destination"
                        placeholder="Where do you want to go?"
                        value={tripPlan.destination}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, destination: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="2000"
                        value={tripPlan.budget}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="startDate"
                        type="date"
                        value={tripPlan.startDate}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, startDate: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="endDate"
                        type="date"
                        value={tripPlan.endDate}
                        onChange={(e) => setTripPlan(prev => ({ ...prev, endDate: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="travelers">Number of Travelers</Label>
                    <Select 
                      value={tripPlan.travelers.toString()} 
                      onValueChange={(value) => setTripPlan(prev => ({ ...prev, travelers: parseInt(value) }))}
                    >
                      <SelectTrigger>
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
                  <Label>Travel Preferences</Label>
                  <p className="text-sm text-gray-600 mb-3">Select all that apply to personalize your experience</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {travelPreferences.map((preference) => (
                      <button
                        key={preference}
                        onClick={() => handlePreferenceToggle(preference)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          tripPlan.preferences.includes(preference)
                            ? 'border-blue-300 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                        style={{
                          backgroundColor: tripPlan.preferences.includes(preference) ? '#36bcf8' : 'white'
                        }}
                      >
                        {preference}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={generateAISuggestions}
                    disabled={isGenerating || !tripPlan.destination || !tripPlan.startDate || !tripPlan.endDate}
                    className="text-white"
                    style={{ backgroundColor: '#36bcf8' }}
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating AI Suggestions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Suggestions Step */}
          <TabsContent value="suggestions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#36bcf8' }} />
                  <span>AI-Generated Destination Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiSuggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiSuggestions.map((suggestion, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {suggestion.destination}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">
                            {suggestion.reason}
                          </p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Estimated Cost:</span>
                              <span className="font-semibold">${suggestion.estimatedCost}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.activities.map((activity: string, actIndex: number) => (
                                <Badge 
                                  key={actIndex}
                                  variant="secondary"
                                  className="text-xs"
                                  style={{ backgroundColor: '#e0f7ff', color: '#36bcf8' }}
                                >
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => generateItinerary(suggestion.destination)}
                            className="w-full text-white"
                            style={{ backgroundColor: '#36bcf8' }}
                          >
                            Choose This Destination
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No suggestions available. Please go back and set your preferences.</p>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('preferences')}
                  >
                    Back to Preferences
                  </Button>
                  {tripPlan.destination && (
                    <Button
                      onClick={() => generateItinerary()}
                      className="text-white"
                      style={{ backgroundColor: '#36bcf8' }}
                    >
                      Skip & Create Itinerary
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Itinerary Step */}
          <TabsContent value="itinerary">
            <div className="space-y-6">
              {/* Trip Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" style={{ color: '#36bcf8' }} />
                      <span>Trip to {tripPlan.destination}</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={saveTripPlan}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2" style={{ color: '#36bcf8' }} />
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">
                        {getDaysBetweenDates(tripPlan.startDate, tripPlan.endDate)} days
                      </p>
                    </div>
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-2" style={{ color: '#36bcf8' }} />
                      <p className="text-sm text-gray-600">Travelers</p>
                      <p className="font-semibold">{tripPlan.travelers}</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto mb-2" style={{ color: '#36bcf8' }} />
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold">${tripPlan.budget}</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto mb-2" style={{ color: '#36bcf8' }} />
                      <p className="text-sm text-gray-600">Estimated Cost</p>
                      <p className="font-semibold">${tripPlan.totalCost}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Itinerary */}
              <div className="space-y-4">
                {Object.entries(tripPlan.itinerary).map(([date, activities]) => (
                  <Card key={date}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {formatDate(date)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                            <div 
                              className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: activityTypes[activity.type].color }}
                            >
                              {activityTypes[activity.type].icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {activity.time}
                                  </Badge>
                                  {activity.cost && (
                                    <Badge className="text-xs text-white" style={{ backgroundColor: '#36bcf8' }}>
                                      ${activity.cost}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              {activity.location && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {activity.location}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('suggestions')}
                >
                  Back to Suggestions
                </Button>
                <div className="space-x-2">
                  <Button
                    onClick={() => onNavigate('booking')}
                    className="text-white"
                    style={{ backgroundColor: '#36bcf8' }}
                  >
                    Book This Trip
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}