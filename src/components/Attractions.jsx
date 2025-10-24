import React, { useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function Attractions({ payload, onNavigate }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const destinationId = payload?.destinationId;

  useEffect(() => {
    console.log('Fetching attractions for destination ID:', destinationId);
    if (!destinationId) {
      setError('Destination ID missing');
      setLoading(false);
      return;
    }
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/places?destination=${destinationId}`);
        if (!response.ok) throw new Error('Failed to fetch attractions');
        const data = await response.json();
        setPlaces(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [destinationId]);

  if (loading) return <div className="p-6 text-center">Loading attractions...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg text-gray-900 dark:text-white">
      <button
        onClick={() => onNavigate('booking')}
        className="mb-4 text-cyan-600 dark:text-cyan-400 underline"
        type="button"
      >
        &larr; Back to Booking
      </button>
      <h2 className="text-3xl font-bold mb-4">Must See Attractions</h2>
      {places.length === 0 ? (
        <p>No attractions found.</p>
      ) : (
        places.map((place) => (
          <div key={place._id} className="mb-6">
            <h3 className="text-xl font-semibold">{place.name}</h3>
            <p>{place.description}</p>
            <p className="text-sm text-slate-500">{place.address}</p>
            <img
              src={place.images?.[0] || ''}
              alt={place.name}
              className="w-full h-48 object-cover rounded mt-2"
            />
          </div>
        ))
      )}
    </div>
  );
}
