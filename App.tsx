import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Plus, Compass, Sparkles, Loader2, Heart } from 'lucide-react';
import { MOCK_EVENTS } from './services/mockData';
import { LocalEvent, UserLocation, UserPreferences } from './types';
import EventCard from './components/EventCard';
import AddEventModal from './components/AddEventModal';
import { searchEventsWithAI, getPersonalizedRecommendations } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [events, setEvents] = useState<LocalEvent[]>(MOCK_EVENTS);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filtering
  const [filteredEventIds, setFilteredEventIds] = useState<string[] | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [showPersonalized, setShowPersonalized] = useState(false);

  // User Preferences (Persisted)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('localPulse_prefs');
    return saved ? JSON.parse(saved) : { likedEventIds: [], likedCategories: {} };
  });

  // --- Effects ---
  
  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('localPulse_prefs', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Get User Location on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          // Default to Harare, Zimbabwe for demo if permission denied
          setUserLocation({ lat: -17.8216, lng: 31.0492 }); 
        }
      );
    }
  }, []);

  // Calculate distances when location changes
  useEffect(() => {
    if (userLocation) {
      setEvents(prev => prev.map(event => {
        if (event.coordinates) {
          const dist = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            event.coordinates.lat, 
            event.coordinates.lng
          );
          return { ...event, distance: dist };
        }
        return event;
      }));
    }
  }, [userLocation]);

  // Handle "For You" Mode
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (showPersonalized) {
        setIsSearching(true);
        try {
          const recommendedIds = await getPersonalizedRecommendations(userPreferences, userLocation, events);
          setFilteredEventIds(recommendedIds);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else if (!searchQuery) {
        // Reset if toggling off and no search query active
        setFilteredEventIds(null);
      }
    };

    fetchRecommendations();
  }, [showPersonalized, userPreferences.likedEventIds.length]); // Re-run if likes change while in "For You" mode

  // --- Helpers ---

  // Haversine formula for distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  // --- Handlers ---

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredEventIds(null);
      if (showPersonalized) setShowPersonalized(false);
      return;
    }

    // Disable personalized mode when manual searching
    setShowPersonalized(false);
    setIsSearching(true);
    try {
      const matchedIds = await searchEventsWithAI(searchQuery, events);
      setFilteredEventIds(matchedIds);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddEvent = (newEvent: LocalEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleToggleLike = (event: LocalEvent) => {
    setUserPreferences(prev => {
      const isLiked = prev.likedEventIds.includes(event.id);
      let newLikedIds = isLiked 
        ? prev.likedEventIds.filter(id => id !== event.id)
        : [...prev.likedEventIds, event.id];
      
      const newCategories = { ...prev.likedCategories };
      if (isLiked) {
        newCategories[event.category] = Math.max(0, (newCategories[event.category] || 0) - 1);
      } else {
        newCategories[event.category] = (newCategories[event.category] || 0) + 1;
      }

      return {
        likedEventIds: newLikedIds,
        likedCategories: newCategories
      };
    });
  };

  // --- Derived State ---

  const displayedEvents = useMemo(() => {
    let result = events;
    
    // Filter by Search/Recommendation IDs
    if (filteredEventIds) {
      result = result.filter(e => filteredEventIds.includes(e.id));
      // Sort by rank returned by AI (preserving order of filteredEventIds)
      result.sort((a, b) => filteredEventIds.indexOf(a.id) - filteredEventIds.indexOf(b.id));
    }

    // Filter by Distance
    if (maxDistance !== null) {
      result = result.filter(e => {
        if (e.distance === undefined) return false;
        return e.distance <= maxDistance;
      });
    }

    return result;
  }, [events, filteredEventIds, maxDistance]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setFilteredEventIds(null); setShowPersonalized(false); setSearchQuery('')}}>
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                LP
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 hidden sm:block">
                LocalPulse
              </span>
            </div>
            
            <div className="flex items-center gap-4">
               {userLocation && (
                 <div className="hidden md:flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                   <MapPin className="w-4 h-4 mr-1 text-primary" />
                   <span>Harare, ZW</span>
                 </div>
               )}
               <button 
                 onClick={() => setIsAddModalOpen(true)}
                 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
               >
                 <Plus className="w-4 h-4" />
                 <span className="hidden sm:inline">Add Event</span>
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Search Section */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-10 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Discover what's happening <span className="text-primary">nearby</span>.
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Crowdsourced local events in Zimbabwe, curated by community and powered by AI.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mt-8">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isSearching && !showPersonalized ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  )}
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-24 py-4 bg-white border border-slate-200 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-xl shadow-slate-200/50 transition-all"
                  placeholder="Ask AI: 'Jazz in Harare this weekend'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                   <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1">
                     <Sparkles className="w-3 h-3" />
                     Search
                   </button>
                </div>
             </div>
          </form>

          {/* Personalized Toggle */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                setSearchQuery('');
                setShowPersonalized(!showPersonalized);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                showPersonalized 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isSearching && showPersonalized ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className={`w-4 h-4 ${showPersonalized ? 'text-white' : 'text-primary'}`} />
              )}
              For You
            </button>
          </div>
          
          {(filteredEventIds && !showPersonalized) && (
               <div className="mt-2 text-sm text-slate-500 flex items-center justify-center gap-2">
                 <span>Found {filteredEventIds.length} matches.</span>
                 <button onClick={() => { setFilteredEventIds(null); setSearchQuery(''); }} className="text-primary hover:underline">Clear</button>
               </div>
           )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Filters / Stats Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-800">
              {showPersonalized ? 'Recommended for You' : (filteredEventIds ? 'Search Results' : 'Trending Events')}
            </h2>
            <span className="text-sm font-medium text-slate-400 ml-2">({displayedEvents.length})</span>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            
            {/* Distance Filter */}
            <div className="relative">
              <select 
                className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary hover:bg-slate-50 transition-colors cursor-pointer"
                value={maxDistance?.toString() || 'any'}
                onChange={(e) => setMaxDistance(e.target.value === 'any' ? null : Number(e.target.value))}
              >
                <option value="any">Any Distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
                <option value="100">Within 100 km</option>
              </select>
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary hover:bg-slate-50 cursor-pointer">
              <option>Sort by: Recommended</option>
              <option>Date: Soonest</option>
              <option>Distance: Nearest</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                isLiked={userPreferences.likedEventIds.includes(event.id)}
                onToggleLike={handleToggleLike}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
               {showPersonalized ? <Heart className="w-8 h-8 text-slate-400" /> : <Search className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              {showPersonalized ? "No recommendations yet" : "No events found"}
            </h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              {showPersonalized 
                ? "Like some events to help us learn what you enjoy, or try a broader distance filter." 
                : (maxDistance ? `Try increasing the distance filter range.` : `Try adjusting your search or add a new event yourself!`)}
            </p>
            {maxDistance && (
               <button 
                onClick={() => setMaxDistance(null)}
                className="mt-4 text-primary font-medium hover:underline"
               >
                 Clear distance filter
               </button>
            )}
          </div>
        )}

      </main>

      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddEvent={handleAddEvent}
      />

    </div>
  );
};

export default App;