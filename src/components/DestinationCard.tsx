import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DestinationCardProps {
  name: string;
  location: string;
  image: string;
  rating: number;
  duration: string;
  price: string;
  description: string;
  tags: string[];
  onClick?: () => void;
}

export function DestinationCard({
  name,
  location,
  image,
  rating,
  duration,
  price,
  description,
  tags,
  onClick
}: DestinationCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge 
            className="text-white font-semibold"
            style={{ backgroundColor: '#36bcf8' }}
          >
            {price}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-1 bg-black bg-opacity-50 rounded-full px-2 py-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm font-medium">{rating}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{name}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{location}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{duration}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: '#e0f7ff', color: '#36bcf8' }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}