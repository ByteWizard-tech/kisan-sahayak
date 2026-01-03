import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FarmerProfile, WeatherData, Language, AdvisoryResponse, WeeklyPlan } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const advisorySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    advisoryTitle: { type: Type.STRING, description: "A short, encouraging title for the advice." },
    actionItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 distinct, simple, actionable steps for the farmer."
    },
    alertLevel: {
      type: Type.STRING,
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "Urgency level based on weather and crop stage."
    },
    alertMessage: { type: Type.STRING, description: "If High/Medium, a specific warning (e.g., 'Heavy rain expected'). Keep empty if Low." },
    reasoning: { type: Type.STRING, description: "Simple scientific explanation for the advice (Trust Layer)." }
  },
  required: ["advisoryTitle", "actionItems", "alertLevel", "reasoning"]
};

const weeklySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Day name (e.g., Monday)" },
          activity: { type: Type.STRING, description: "Short farming activity" },
          risk: { type: Type.STRING, description: "Potential risk (Low/Med/High)" }
        }
      }
    },
    generalAdvice: { type: Type.STRING, description: "One sentence summary for the week" }
  },
  required: ["days", "generalAdvice"]
};

// --- Storage Keys ---
const ADVISORY_CACHE_KEY = 'kisan_advisory_cache';
const WEEKLY_CACHE_KEY = 'kisan_weekly_cache';

// --- Functions ---

export const generateCropAdvisory = async (
  profile: FarmerProfile,
  weather: WeatherData,
  language: Language
): Promise<AdvisoryResponse> => {
  
  // 1. Check Offline Status
  if (!navigator.onLine) {
    console.log("App is offline. Checking cache...");
    const cached = localStorage.getItem(ADVISORY_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed, isOfflineData: true };
    } else {
      // Fallback if absolutely no data and no internet
      return {
        advisoryTitle: "No Connection & No Data",
        actionItems: ["Please connect to the internet to download initial advisories."],
        alertLevel: "LOW",
        reasoning: "Offline mode requires at least one previous successful sync.",
        isOfflineData: true
      };
    }
  }

  // 2. Online: Fetch from Gemini
  try {
    const model = "gemini-2.5-flash-latest"; 

    const prompt = `
      You are a friendly, expert agricultural advisor for a smallholder farmer in India.
      
      Farmer Context:
      - Location: ${profile.location}
      - Crop: ${profile.crop}
      - Growth Stage: ${profile.stage}
      
      Current Local Weather:
      - Condition: ${weather.condition}
      - Temperature: ${weather.temp}°C
      - Forecast: ${weather.forecast}
      
      Task:
      Provide hyper-local, practical farming advice. 
      Output language must be: ${language}.
      
      Constraint:
      - Keep language extremely simple (5th-grade level).
      - No jargon.
      - Focus on immediate actions.
      - If the weather is 'Storm' or 'Rainy', prioritize drainage and crop protection.
      - If 'Sunny' and high temp, prioritize irrigation management.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: advisorySchema,
        temperature: 0.4,
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("No response from AI");

    const result = JSON.parse(textResponse) as AdvisoryResponse;
    
    // 3. Cache the result
    const resultWithMeta = { ...result, timestamp: Date.now() };
    localStorage.setItem(ADVISORY_CACHE_KEY, JSON.stringify(resultWithMeta));

    return resultWithMeta;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return cached data if API fails even if online
    const cached = localStorage.getItem(ADVISORY_CACHE_KEY);
    if (cached) {
      return { ...JSON.parse(cached), isOfflineData: true, alertMessage: "Using saved data (Server Error)" };
    }
    
    return {
      advisoryTitle: "Service Unreachable",
      actionItems: ["Check internet connection.", "Try again later."],
      alertLevel: "LOW",
      reasoning: "Server connection failed."
    };
  }
};

export const generateWeeklyPlan = async (
  profile: FarmerProfile,
  language: Language
): Promise<WeeklyPlan | null> => {
  // Offline Check for Weekly Plan
  if (!navigator.onLine) {
    const cached = localStorage.getItem(WEEKLY_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-latest",
      contents: [{
        role: "user",
        parts: [{ text: `Generate a 7-day simplified farming plan for ${profile.crop} in ${profile.stage} stage. Location: ${profile.location}. Language: ${language}. Focus on resilience.` }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: weeklySchema,
      }
    });

    if (response.text) {
      const plan = JSON.parse(response.text);
      localStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify({ ...plan, generatedAt: Date.now() }));
      return plan;
    }
    return null;
  } catch (e) {
    console.error("Weekly plan error", e);
    return null;
  }
};

export const getCachedWeeklyPlan = (): WeeklyPlan | null => {
  const cached = localStorage.getItem(WEEKLY_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};