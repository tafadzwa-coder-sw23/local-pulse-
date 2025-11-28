export enum EventCategory {
  MUSIC = 'Music',
  FOOD = 'Food & Drink',
  ART = 'Arts & Culture',
  SPORTS = 'Sports',
  COMMUNITY = 'Community',
  TECH = 'Technology',
  NIGHTLIFE = 'Nightlife',
  OUTDOORS = 'Outdoors'
}

export interface LocalEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: EventCategory;
  imageUrl: string;
  attendees: number;
  rating: number; // 0-5
  distance?: number; // Calculated distance in km
  tags: string[];
}

export interface AIParsedEvent {
  title: string;
  description: string;
  category: EventCategory;
  tags: string[];
  suggestedTime?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface UserPreferences {
  likedEventIds: string[];
  likedCategories: Record<string, number>; // Category -> Count
}