import { LocalEvent, EventCategory } from '../types';

export const MOCK_EVENTS: LocalEvent[] = [
  {
    id: '1',
    title: 'Harare Jazz Festival',
    description: 'A vibrant celebration of jazz in the capital featuring Oliver Mtukudzi tribute bands and rising afro-jazz stars.',
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    location: 'Harare Gardens',
    category: EventCategory.MUSIC,
    imageUrl: 'https://picsum.photos/800/600?random=10',
    attendees: 1200,
    rating: 4.9,
    tags: ['jazz', 'afro-jazz', 'live music', 'outdoor'],
    coordinates: { lat: -17.8249, lng: 31.0498 } 
  },
  {
    id: '2',
    title: 'Bulawayo Arts & Crafts Fair',
    description: 'Discover unique handmade crafts, stone sculptures, and basketry from local artisans in the City of Kings.',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: 'Bulawayo City Hall',
    category: EventCategory.ART,
    imageUrl: 'https://picsum.photos/800/600?random=11',
    attendees: 450,
    rating: 4.6,
    tags: ['arts', 'crafts', 'culture', 'family'],
    coordinates: { lat: -20.1559, lng: 28.5813 }
  },
  {
    id: '3',
    title: 'Zim Tech Innovation Summit',
    description: 'A gathering of Zimbabwe\'s brightest minds in fintech, agritech, and software development. Networking and pitch sessions.',
    date: new Date(Date.now() + 86400000 * 1).toISOString(),
    location: 'Rainbow Towers, Harare',
    category: EventCategory.TECH,
    imageUrl: 'https://picsum.photos/800/600?random=12',
    attendees: 300,
    rating: 4.5,
    tags: ['tech', 'startups', 'innovation', 'business'],
    coordinates: { lat: -17.8318, lng: 31.0335 }
  },
  {
    id: '4',
    title: 'Victoria Falls Sunset Cruise',
    description: 'Relax on the Zambezi River with drinks and snacks while watching hippos and elephants as the sun goes down.',
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'Zambezi River, Vic Falls',
    category: EventCategory.OUTDOORS,
    imageUrl: 'https://picsum.photos/800/600?random=13',
    attendees: 80,
    rating: 4.8,
    tags: ['cruise', 'wildlife', 'sunset', 'tourism'],
    coordinates: { lat: -17.9244, lng: 25.8567 }
  },
  {
    id: '5',
    title: 'Traditional Food Festival',
    description: 'Experience the authentic taste of Zimbabwe. Sadza, roadrunner, madora, and mazhanje on the menu.',
    date: new Date(Date.now() + 86400000 * 6).toISOString(),
    location: 'Mukuvisi Woodlands',
    category: EventCategory.FOOD,
    imageUrl: 'https://picsum.photos/800/600?random=14',
    attendees: 600,
    rating: 4.7,
    tags: ['food', 'traditional', 'culture', 'outdoors'],
    coordinates: { lat: -17.8509, lng: 31.0874 }
  },
  {
    id: '6',
    title: 'Kariba Houseboat Party',
    description: 'A weekend getaway on Lake Kariba. Fishing, music, and good vibes under the stars.',
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    location: 'Lake Kariba',
    category: EventCategory.NIGHTLIFE,
    imageUrl: 'https://picsum.photos/800/600?random=15',
    attendees: 40,
    rating: 4.9,
    tags: ['party', 'travel', 'fishing', 'weekend'],
    coordinates: { lat: -16.5333, lng: 28.8000 }
  }
];