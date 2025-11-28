import React from 'react';
import { LocalEvent } from '../types';
import { Calendar, MapPin, Users, Star, Heart } from 'lucide-react';

interface EventCardProps {
  event: LocalEvent;
  isLiked?: boolean;
  onToggleLike?: (event: LocalEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isLiked = false, onToggleLike }) => {
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 group relative">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
          {event.category}
        </div>
        
        {/* Like Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike?.(event);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
            isLiked 
              ? 'bg-red-500/90 text-white' 
              : 'bg-white/90 text-slate-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {event.rating.toFixed(1)}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
        </div>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-slate-600 text-xs">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>{dateStr} • {timeStr}</span>
          </div>
          <div className="flex items-center text-slate-600 text-xs">
            <MapPin className="w-4 h-4 mr-2 text-secondary" />
            <span className="truncate">{event.location} {event.distance !== undefined ? `• ${event.distance.toFixed(1)} km` : ''}</span>
          </div>
          <div className="flex items-center text-slate-600 text-xs">
            <Users className="w-4 h-4 mr-2 text-emerald-500" />
            <span>{event.attendees} going</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {event.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full uppercase tracking-wider">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventCard;