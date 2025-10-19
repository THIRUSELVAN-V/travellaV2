import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  MapPin,
  CheckCircle,
  Calendar,
  BedDouble,
  Star,
  CreditCard,
  X,
} from 'lucide-react';

interface BookingProcessProps {
  onNavigate: (page: string) => void;
}

type ItemType = 'hotel' | 'vehicle' | 'flight' | 'package';
type PaymentType = 'Credit Card' | 'Debit Card' | 'UPI' | 'PayPal';

type Hotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number; // per night
  amenities: string[];
  image: string;
};

export default function BookingProcess({ onNavigate }: BookingProcessProps) {
  // Core state
  const [itemType, setItemType] = useState<ItemType>('hotel');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelStyle, setTravelStyle] = useState<string>('Relax');
  const [paymentMethod, setPaymentMethod] = useState<PaymentType | ''>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // UI state for day selection & plans
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [dayPlans, setDayPlans] = useState<string[]>([]); // each index => a string plan
  const [dayPlanInputs, setDayPlanInputs] = useState<string>(''); // input for currently selected day

  // Selected hotels per day (map index -> hotel)
  const [selectedHotels, setSelectedHotels] = useState<Record<number, Hotel | null>>({});

  // sample static hotel list
  const hotels: Hotel[] = [
    {
      id: 'h1',
      name: 'The Royal Meridian',
      location: 'Manhattan, New York',
      rating: 4.9,
      price: 349,
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    },
    {
      id: 'h2',
      name: 'Seaside Escape',
      location: 'Maldives',
      rating: 4.8,
      price: 420,
      amenities: ['Beach', 'Breakfast', 'Water Sports', 'Spa'],
      image: 'https://images.unsplash.com/photo-1501117716987-c8e3bdb4a3d8?w=800',
    },
    {
      id: 'h3',
      name: 'Mountain Lodge',
      location: 'Swiss Alps',
      rating: 4.7,
      price: 280,
      amenities: ['Hiking', 'Breakfast', 'Sauna', 'Ski Access'],
      image: 'https://images.unsplash.com/photo-1501117716987-c8e3bdb4a3d8?w=801',
    },
  ];

  // compute trip days from dates
  const tripDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    // diff in days (endDate exclusive => nights is difference; we treat duration as days between)
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  // initialize dayPlans and selectedHotels when tripDays changes
  useEffect(() => {
    if (tripDays < 1) {
      setDayPlans([]);
      setSelectedHotels({});
      setSelectedDayIndex(0);
      return;
    }
    setDayPlans((prev) => {
      const next = Array.from({ length: tripDays }, (_, i) => prev[i] ?? '');
      return next;
    });
    setSelectedHotels((prev) => {
      const next: Record<number, Hotel | null> = {};
      for (let i = 0; i < tripDays; i++) {
        next[i] = prev[i] ?? null;
      }
      return next;
    });
    setSelectedDayIndex((idx) => (idx < tripDays ? idx : 0));
    // clear messages
    setErrorMsg('');
    setSuccessMsg('');
  }, [tripDays]);

  // total cost: sum of selected hotels' prices for nights for days where hotel selected (hotel price * nights for that day)
  const totalPrice = useMemo(() => {
    if (itemType !== 'hotel') return 0;
    let sum = 0;
    for (let d = 0; d < tripDays; d++) {
      const hotel = selectedHotels[d];
      if (hotel) sum += hotel.price;
    }
    return sum;
  }, [selectedHotels, tripDays, itemType]);

  // handlers
  const handleDayTabClick = (index: number) => {
    setSelectedDayIndex(index);
    setDayPlanInputs(dayPlans[index] ?? '');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAddPlanForSelectedDay = () => {
    if (!dayPlanInputs.trim()) {
      setErrorMsg('Please enter a plan for this day before adding.');
      return;
    }
    setDayPlans((prev) => {
      const copy = [...prev];
      copy[selectedDayIndex] = dayPlanInputs.trim();
      return copy;
    });
    setErrorMsg('');
    setSuccessMsg('Plan added for Day ' + (selectedDayIndex + 1));
  };

  const handleSelectHotelForDay = (dayIndex: number, hotel: Hotel) => {
    setSelectedHotels((prev) => ({ ...prev, [dayIndex]: hotel }));
    setSuccessMsg(`Selected ${hotel.name} for Day ${dayIndex + 1}`);
    setErrorMsg('');
  };

  const handleRemoveHotelForDay = (dayIndex: number) => {
    setSelectedHotels((prev) => ({ ...prev, [dayIndex]: null }));
  };

  const handleConfirmBooking = () => {
    if (!destination.trim()) {
      setErrorMsg('Please enter a destination.');
      return;
    }
    if (tripDays < 1) {
      setErrorMsg('Please select a valid date range (end date after start date).');
      return;
    }
    if (dayPlans.some((p) => !p || !p.trim())) {
      setErrorMsg('Please add plan for every day.');
      return;
    }
    if (!paymentMethod) {
      setErrorMsg('Please select a payment method.');
      return;
    }
    // success (you can hook API call here)
    setErrorMsg('');
    setSuccessMsg('Success! Your trip is booked. 🎉');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <Card className="shadow-md border border-gray-200 bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-sky-500" /> Plan Your Trip
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 font-semibold">Destination</Label>
                <Input
                  type="text"
                  placeholder="e.g., Paris, Tokyo, Maldives"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-2 border-gray-300 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Booking Type</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['hotel', 'vehicle', 'flight', 'package'] as ItemType[]).map(
                    (type) => (
                      <Button
                        key={type}
                        variant={itemType === type ? 'default' : 'outline'}
                        className={`capitalize rounded-full px-4 ${
                          itemType === type
                            ? 'bg-sky-500 text-white'
                            : 'border-gray-300 text-gray-700'
                        }`}
                        onClick={() => setItemType(type)}
                      >
                        {type}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 font-semibold">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 border-gray-300 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 border-gray-300 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
            </div>

            {/* Travel style */}
            <div>
              <Label className="text-gray-700 font-semibold">Travel Style</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Relax', 'Adventure', 'Cultural', 'Romantic', 'Nature'].map(
                  (style) => (
                    <Badge
                      key={style}
                      className={`cursor-pointer px-3 py-1 rounded-full text-sm ${
                        travelStyle === style
                          ? 'bg-sky-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setTravelStyle(style)}
                    >
                      {style}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Day selector (tags) */}
            <div>
              <Label className="text-gray-700 font-semibold">Select Day</Label>
              <div className="flex gap-2 flex-wrap mt-3">
                {tripDays > 0 ? (
                  Array.from({ length: tripDays }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleDayTabClick(i)}
                      className={`px-3 py-1 rounded-full border ${
                        selectedDayIndex === i
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      Day {i + 1}
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Select valid start & end dates</div>
                )}
              </div>
            </div>

            {/* Day plan input for selected day */}
            <div>
              <Label className="text-gray-700 font-semibold">
                Plan for Day {selectedDayIndex + 1}
              </Label>
              <div className="flex gap-3 mt-2">
                <Input
                  type="text"
                  placeholder="Add a place / activity for this day (e.g., Eiffel Tower visit)"
                  value={dayPlanInputs}
                  onChange={(e) => setDayPlanInputs(e.target.value)}
                />
                <Button onClick={handleAddPlanForSelectedDay}>Add</Button>
              </div>
              {/* show current plan for selected day */}
              <div className="mt-2">
                <div className="text-sm text-gray-600">Current: {dayPlans[selectedDayIndex] || '-'}</div>
              </div>
            </div>

            {/* Hotel list (if hotel booking type selected) */}
            {itemType === 'hotel' && tripDays > 0 && (
              <div>
                <Label className="text-gray-700 font-semibold">Choose a hotel for a day</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {hotels.map((h) => (
                    <div key={h.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                      <img src={h.image} alt={h.name} className="w-full h-36 object-cover" />
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">{h.name}</h4>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={16} />
                            <span className="text-sm text-gray-700">{h.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{h.location}</p>
                        <p className="mt-2 font-medium text-gray-800">${h.price}/night</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {h.amenities.slice(0, 3).map((a) => (
                            <Badge key={a} className="bg-gray-100 text-gray-700">{a}</Badge>
                          ))}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button
                            onClick={() => handleSelectHotelForDay(selectedDayIndex, h)}
                            className="flex-1"
                          >
                            Select & Add (Day {selectedDayIndex + 1})
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // quick preview by setting inputs to hotel's name
                              setDayPlanInputs(`${h.name} stay`);
                            }}
                            className="px-3"
                          >
                            Use as Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment method */}
            <div>
              <Label className="text-gray-700 font-semibold">Payment Method</Label>
              <div className="flex gap-3 mt-3 flex-wrap">
                {(['Credit Card', 'Debit Card', 'UPI', 'PayPal'] as PaymentType[]).map(
                  (m) => (
                    <Button
                      key={m}
                      variant={paymentMethod === m ? 'default' : 'outline'}
                      className={`rounded-full px-4 ${
                        paymentMethod === m ? 'bg-sky-500 text-white' : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setPaymentMethod(m)}
                    >
                      <CreditCard size={14} />
                      <span className="ml-2">{m}</span>
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4 border-gray-200">
              <h3 className="font-bold text-lg text-gray-800">Trip Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-gray-700"><strong>Destination:</strong> {destination || '-'}</p>
                  <p className="text-gray-700"><strong>Dates:</strong> {startDate || '-'} → {endDate || '-'}</p>
                  <p className="text-gray-700"><strong>Days:</strong> {tripDays}</p>
                  <p className="text-gray-700"><strong>Style:</strong> {travelStyle}</p>
                  <p className="text-gray-700"><strong>Booking Type:</strong> {itemType}</p>
                </div>

                <div>
                  <p className="text-gray-700"><strong>Payment:</strong> {paymentMethod || '-'}</p>
                  <p className="text-gray-700"><strong>Estimated hotel total:</strong> ${totalPrice}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold">Day-wise Plans & Hotels</h4>
                <div className="mt-2 space-y-2">
                  {tripDays > 0 ? (
                    Array.from({ length: tripDays }).map((_, d) => (
                      <div key={d} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">Day {d + 1}</div>
                          <div className="font-medium text-gray-800">{dayPlans[d] || '-'}</div>
                          <div className="text-sm text-gray-600">{selectedHotels[d] ? selectedHotels[d]!.name : 'No hotel selected'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedHotels[d] ? (
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-700 font-medium">${selectedHotels[d]!.price}</div>
                              <button
                                onClick={() => handleRemoveHotelForDay(d)}
                                className="text-sm text-red-600 px-2 py-1 border rounded"
                                title="Remove hotel for this day"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">No hotel</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No days selected</div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            {successMsg && (
              <Alert className="bg-sky-50 border-sky-200 text-sky-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-sky-600" />
                <AlertDescription>{successMsg}</AlertDescription>
                <button onClick={() => { setSuccessMsg(''); }} title="Dismiss">
                  <X className="h-4 w-4 ml-2 text-sky-600" />
                </button>
              </Alert>
            )}

            {/* Confirm */}
            <div className="pt-4">
              <Button
                className="w-full bg-sky-500 text-white font-semibold py-3 rounded-full shadow-sm"
                onClick={handleConfirmBooking}
              >
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
