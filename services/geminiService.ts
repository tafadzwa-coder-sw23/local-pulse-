import { GoogleGenAI, Type } from "@google/genai";
import { AIParsedEvent, LocalEvent, EventCategory, UserPreferences, UserLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to parse raw user input into a structured event object.
 */
export const parseEventWithAI = async (rawInput: string): Promise<AIParsedEvent | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract event details from this text. If details are missing, creatively infer them to make it sound exciting. 
      Input: "${rawInput}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy, short title for the event" },
            description: { type: Type.STRING, description: "A compelling 2-sentence description" },
            category: { 
              type: Type.STRING, 
              enum: Object.values(EventCategory),
              description: "The most fitting category" 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-5 relevant lowercase tags" 
            },
            suggestedTime: { type: Type.STRING, description: "ISO date string suggestions based on input (e.g. 'next friday at 5pm' -> actual date) or null if not inferable" }
          },
          required: ["title", "description", "category", "tags"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as AIParsedEvent;
  } catch (error) {
    console.error("AI Parse Error:", error);
    return null;
  }
};

/**
 * Uses Gemini to perform a semantic search on the client-side mock data.
 * We send the metadata of events to Gemini and ask it to rank them based on the query.
 */
export const searchEventsWithAI = async (query: string, events: LocalEvent[]): Promise<string[]> => {
  try {
    // Create a lightweight representation of events to send to the model
    const eventSummaries = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      tags: e.tags.join(", "),
      category: e.category,
      date: e.date
    }));

    const prompt = `
    You are an event recommendation engine. 
    User Query: "${query}"
    
    Here is the list of available events:
    ${JSON.stringify(eventSummaries)}
    
    Return a JSON array of event IDs that match the user's intent, ranked by relevance.
    If no events match well, return an empty array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || '[]') as string[];
  } catch (error) {
    console.error("AI Search Error:", error);
    return [];
  }
};

/**
 * Generates personalized recommendations based on user history and location.
 */
export const getPersonalizedRecommendations = async (
  prefs: UserPreferences,
  location: UserLocation | null,
  allEvents: LocalEvent[]
): Promise<string[]> => {
  try {
    // 1. Summarize user profile
    const likedCategories = Object.entries(prefs.likedCategories)
      .sort(([,a], [,b]) => b - a)
      .map(([cat]) => cat)
      .slice(0, 3)
      .join(", ");

    const likedEvents = allEvents
      .filter(e => prefs.likedEventIds.includes(e.id))
      .map(e => e.title)
      .join(", ");

    // 2. Summarize candidate events
    const eventSummaries = allEvents.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      tags: e.tags.join(", "),
      distance: e.distance ? `${e.distance.toFixed(1)}km` : "Unknown"
    }));

    const prompt = `
      You are a hyper-personalized local concierge. 
      
      User Profile:
      - Favorite Categories: ${likedCategories || "None yet"}
      - Previously Liked Events: ${likedEvents || "None yet"}
      - Current Location Context: ${location ? "Known" : "Unknown"}

      Task: Rank the available events below for this user. 
      Prioritize events that match their category interests and are geographically closer if distance is known.
      If the user has no history, prioritize popular events with high ratings.

      Available Events:
      ${JSON.stringify(eventSummaries)}

      Return a JSON array of event IDs ordered by recommendation strength (Strongest first).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || '[]') as string[];

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};