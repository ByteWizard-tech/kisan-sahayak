import React, { useEffect, useState, useCallback } from 'react';
import { CloudRain, Sun, Droplets, Volume2, ShieldCheck, AlertOctagon, RefreshCw, Globe, WifiOff, Download, Calendar } from 'lucide-react';
import { FarmerProfile, WeatherData, AdvisoryResponse, Language, WeeklyPlan } from '../types';
import { generateCropAdvisory, generateWeeklyPlan, getCachedWeeklyPlan } from '../services/geminiService';
import { Button } from './Button';

interface Props {
  profile: FarmerProfile;
  logout: () => void;
}

// Mock Weather Data Generator
const getMockWeather = (): WeatherData => {
  const conditions: WeatherData['condition'][] = ['Sunny', 'Rainy', 'Cloudy', 'Storm'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  return {
    condition,
    temp: 24 + Math.floor(Math.random() * 10),
    humidity: 60 + Math.floor(Math.random() * 30),
    forecast: condition === 'Rainy' || condition === 'Storm' 
      ? 'Heavy rain expected next 24h' 
      : 'Clear skies expected'
  };
};

export const FarmerDashboard: React.FC<Props> = ({ profile, logout }) => {
  const [weather, setWeather] = useState<WeatherData>(getMockWeather());
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchAdvisory = useCallback(async () => {
    setLoading(true);
    // Don't clear previous advisory immediately to avoid flicker in offline mode
    const data = await generateCropAdvisory(profile, weather, language);
    setAdvisory(data);
    setLoading(false);
    
    // Check for cached weekly plan
    const cachedPlan = getCachedWeeklyPlan();
    if (cachedPlan) setWeeklyPlan(cachedPlan);

  }, [profile, weather, language]);

  // Initial Fetch
  useEffect(() => {
    fetchAdvisory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); 

  const handleRefresh = () => {
    if (isOffline) {
        alert("You are offline. Showing saved data.");
        return;
    }
    const newWeather = getMockWeather();
    setWeather(newWeather);
    setLoading(true);
    generateCropAdvisory(profile, newWeather, language).then(data => {
        setAdvisory(data);
        setLoading(false);
    });
  };

  const handleDownloadWeekly = async () => {
    if (isOffline) {
      alert("Connect to internet to download fresh weekly plan.");
      return;
    }
    setWeeklyLoading(true);
    const plan = await generateWeeklyPlan(profile, language);
    setWeeklyPlan(plan);
    setWeeklyLoading(false);
  };

  const toggleLanguage = () => {
    const langs = [Language.ENGLISH, Language.HINDI, Language.TAMIL];
    const currentIndex = langs.indexOf(language);
    setLanguage(langs[(currentIndex + 1) % langs.length]);
  };

  const handleSpeak = () => {
    if (!advisory) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${advisory.advisoryTitle}. ${advisory.actionItems.join('. ')}. Alert Level: ${advisory.alertLevel}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Improved Language Support for TTS
    switch(language) {
      case Language.HINDI: utterance.lang = 'hi-IN'; break;
      case Language.TAMIL: utterance.lang = 'ta-IN'; break;
      default: utterance.lang = 'en-IN';
    }

    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const WeatherIcon = () => {
    switch (weather.condition) {
      case 'Rainy': return <CloudRain className="w-12 h-12 text-blue-500" />;
      case 'Storm': return <CloudRain className="w-12 h-12 text-purple-600 animate-pulse" />;
      case 'Sunny': return <Sun className="w-12 h-12 text-orange-500" />;
      default: return <Sun className="w-12 h-12 text-gray-400" />;
    }
  };

  const getAlertColor = (level: string) => {
    if (level === 'HIGH') return 'bg-red-100 border-red-300 text-red-900';
    if (level === 'MEDIUM') return 'bg-amber-100 border-amber-300 text-amber-900';
    return 'bg-green-100 border-green-300 text-green-900';
  };

  return (
    <div className="pb-24 max-w-lg mx-auto md:max-w-4xl">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-gray-800 text-white p-2 text-center text-sm flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" /> Offline Mode: Showing saved data
        </div>
      )}

      {/* Header */}
      <header className="bg-green-700 text-white p-6 rounded-b-3xl shadow-lg mb-6 relative">
         <div className="flex justify-between items-center mb-4">
             <div>
                <h1 className="text-2xl font-bold">{profile.name || "Farmer"}</h1>
                <p className="opacity-90 text-sm">{profile.location} • {profile.crop}</p>
             </div>
             <button onClick={logout} className="text-xs bg-green-800 px-3 py-1 rounded-full">Exit</button>
         </div>

         {/* Weather Card */}
         <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-white p-2 rounded-full shadow-sm">
                 <WeatherIcon />
               </div>
               <div>
                 <p className="text-3xl font-bold">{weather.temp}°C</p>
                 <p className="text-sm font-medium opacity-90">{weather.condition}</p>
               </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-1 text-sm justify-end">
                  <Droplets className="w-4 h-4" /> {weather.humidity}%
                </div>
                <p className="text-xs opacity-75 mt-1 max-w-[100px] leading-tight">{weather.forecast}</p>
            </div>
         </div>
      </header>

      <div className="px-4 space-y-6">
        
        {/* Controls */}
        <div className="flex gap-3 justify-between items-center">
            {/* Weekly Download Button */}
            <button 
              onClick={handleDownloadWeekly}
              disabled={isOffline || weeklyLoading}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border ${isOffline ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-700 border-green-200'}`}
            >
               {weeklyLoading ? <span className="animate-spin">⌛</span> : <Download className="w-4 h-4" />}
               {weeklyPlan ? "Update Weekly" : "Save Weekly Plan"}
            </button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={toggleLanguage} className="!py-2 !px-4 text-sm" icon={<Globe className="w-4 h-4"/>}>
                {language}
              </Button>
              <Button variant="secondary" onClick={handleRefresh} className="!py-2 !px-4 text-sm" icon={<RefreshCw className="w-4 h-4"/>}>
                Refresh
              </Button>
            </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              <p className="text-gray-500 animate-pulse">Consulting Expert AI...</p>
           </div>
        ) : advisory ? (
          <>
            {/* Alert Banner */}
            {(advisory.alertLevel === 'HIGH' || advisory.alertLevel === 'MEDIUM') && (
              <div className={`p-4 rounded-xl border-l-4 flex items-start gap-3 shadow-sm ${getAlertColor(advisory.alertLevel)}`}>
                 <AlertOctagon className="w-6 h-6 flex-shrink-0 mt-1" />
                 <div>
                    <h3 className="font-bold uppercase tracking-wide text-sm mb-1">{advisory.alertLevel} ALERT</h3>
                    <p className="font-medium">{advisory.alertMessage || "Weather conditions require attention."}</p>
                 </div>
              </div>
            )}

            {/* Offline Data Indicator */}
            {advisory.isOfflineData && (
               <div className="text-xs text-center text-gray-400 italic">
                  Last updated: {advisory.timestamp ? new Date(advisory.timestamp).toLocaleString() : 'Unknown'}
               </div>
            )}

            {/* Main Advisory Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
               <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 leading-snug">
                    {advisory.advisoryTitle}
                  </h2>
                  
                  <div className="space-y-4">
                    {advisory.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-green-50 rounded-lg border border-green-100">
                         <div className="bg-green-200 text-green-800 w-8 h-8 flex items-center justify-center rounded-full font-bold flex-shrink-0">
                           {idx + 1}
                         </div>
                         <p className="text-gray-700 font-medium text-lg pt-0.5">{item}</p>
                      </div>
                    ))}
                  </div>
               </div>
               
               {/* Footer / Trust Layer */}
               <div className="bg-gray-50 p-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-600">
                     <ShieldCheck className="w-5 h-5 text-green-600" />
                     <span className="text-sm font-semibold">Why this advice?</span>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    "{advisory.reasoning}"
                  </p>
                  <p className="text-xs text-gray-400 mt-3 text-right">Source: Gemini AI • Weather Analysis</p>
               </div>
            </div>

            {/* Audio Action */}
            <Button 
              fullWidth 
              variant="primary" 
              onClick={handleSpeak}
              className="mt-4 shadow-lg shadow-green-200"
              icon={isSpeaking ? <span className="animate-pulse">●</span> : <Volume2 />}
            >
              {isSpeaking ? "Stop Reading" : "Read Aloud"}
            </Button>

            {/* Weekly Plan Section */}
            {weeklyPlan && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4 text-green-800">
                   <Calendar className="w-6 h-6" />
                   <h3 className="text-lg font-bold">7-Day Resilience Plan</h3>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                   <p className="text-sm text-gray-600 mb-4 italic">{weeklyPlan.generalAdvice}</p>
                   <div className="space-y-3">
                      {weeklyPlan.days.map((day, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="font-semibold text-gray-700 w-24">{day.day}</span>
                           <span className="text-sm text-gray-600 flex-1 px-2">{day.activity}</span>
                           <span className={`text-xs px-2 py-1 rounded font-medium ${day.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                             {day.risk}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 text-gray-500">
             <p>No data available.</p>
             {isOffline && <p className="text-sm mt-2">Connect to internet once to download advisories.</p>}
          </div>
        )}
      </div>
    </div>
  );
};