export enum UserRole {
  FARMER = 'FARMER',
  EXTENSION_OFFICER = 'EXTENSION_OFFICER'
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  TAMIL = 'Tamil'
}

export interface FarmerProfile {
  name: string;
  location: string;
  crop: string;
  stage: string;
  landSize: string;
}

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Rainy' | 'Cloudy' | 'Storm';
  humidity: number;
  forecast: string;
}

// Structure expected from Gemini JSON response
export interface AdvisoryResponse {
  advisoryTitle: string;
  actionItems: string[];
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  alertMessage?: string;
  reasoning: string;
  timestamp?: number; // For offline freshness check
  isOfflineData?: boolean;
}

export interface WeeklyPlan {
  days: {
    day: string;
    activity: string;
    risk: string;
  }[];
  generalAdvice: string;
  generatedAt: number;
}

export interface OfficerStat {
  region: string;
  farmersActive: number;
  alertCount: number;
}