
import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Tag, Star, Map } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL;


export function BookingDetails({ payload, onNavigate }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const destinationId = payload?.destinationId;

  useEffect(() => {
    if (!destinationId) {
      setError('No destination selected');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE_URL}/destinations/${destinationId}`);
        if (!response.ok) throw new Error('Failed to fetch destination details');
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [destinationId]);

  if (loading)
    return <div className="p-6 text-center">Loading destination details...</div>;

  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            
            {/* Hero Section */}
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-slate-50 @[480px]:rounded-xl min-h-[400px]"
                  style={{
                    backgroundImage:
                      `linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 40%), url(${(details.images && details.images[0]) || details.image || ''})`,
                  }}
                >
                  <div className="p-6 md:p-8">
                    <h1 className="text-white tracking-tight text-4xl md:text-5xl font-bold leading-tight">
                      {details.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-3 text-white/90">
                      <MapPin className="w-5 h-5" />
                      <p className="text-lg md:text-xl">
                        {[details.city, details.state, details.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation tabs */}
            <div className="flex gap-2 p-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <p className="text-sm font-medium leading-normal">Overview</p>
              </button>
              <button
                onClick={() => setActiveTab('attractions')}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer transition-colors ${
                  activeTab === 'attractions'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <p className="text-sm font-medium leading-normal">Attractions</p>
              </button>
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer transition-colors ${
                  activeTab === 'itinerary'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <p className="text-sm font-medium leading-normal">Itinerary</p>
              </button>
            </div>

            {/* Content Area */}
            <div className="mt-6 pb-24">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      About {details.name}
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {details.description}
                    </p>
                  </div>

                  {/* Best Season */}
                  {details.bestSeason && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-6 h-6 text-blue-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Best Time to Visit
                          </h3>
                          <p className="text-slate-700 dark:text-slate-300">
                            {details.bestSeason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {details.tags && details.tags.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Tag className="w-6 h-6 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                            Categories
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {details.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Map Location */}
                  {details.mapLocation && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Map className="w-6 h-6 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                            Location
                          </h3>
                          <p className="text-slate-700 dark:text-slate-300 mb-3">
                            Coordinates: {details.mapLocation.lat}, {details.mapLocation.lng}
                          </p>
                          {details.mapLocation.link && (
                            <a
                              href={details.mapLocation.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
                            >
                              View on Google Maps
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Gallery */}
                  {details.images && details.images.length > 1 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Gallery
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {details.images.map((img, index) => (
                          <div
                            key={index}
                            className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden"
                          >
                            <img
                              src={img}
                              alt={`${details.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attractions' && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <Star className="w-6 h-6 text-yellow-500 mt-1" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Top Attractions
                    </h2>
                  </div>
                  {details.topAttractions && details.topAttractions.length > 0 ? (
                    <ul className="space-y-3">
                      {details.topAttractions.map((attraction, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-semibold flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-slate-900 dark:text-white text-lg pt-1">
                            {attraction}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400">
                      No attractions listed yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Suggested Itinerary
                  </h2>
                  {details.itinerary && details.itinerary.length > 0 ? (
                    <div className="space-y-4">
                      {details.itinerary.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <p className="text-slate-900 dark:text-white">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400">
                      No itinerary available yet. Stay tuned for suggested activities and day plans!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Now Button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full shadow-lg p-4 px-6 flex items-center justify-center z-50 hover:bg-blue-600 transition-colors font-semibold"
        onClick={() => onNavigate('bookingProcess', { destinationId: destinationId })}
      >
        Book Now
      </button>
    </div>
  );
}