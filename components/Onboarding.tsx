import React, { useState, useEffect } from 'react';
import { MapPin, Sprout, Calendar, CheckCircle, Mic, MicOff } from 'lucide-react';
import { Button } from './Button';
import { FarmerProfile, Language } from '../types';
import { useVoiceInput } from '../hooks';

interface OnboardingProps {
  onComplete: (profile: FarmerProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  
  const [profile, setProfile] = useState<FarmerProfile>({
    name: '',
    location: 'Maharashtra',
    crop: 'Cotton',
    stage: 'Sowing',
    landSize: '2 Acres'
  });

  const { isListening, transcript, startListening, resetTranscript } = useVoiceInput(language);

  // Effect to apply voice transcript to current field
  useEffect(() => {
    if (transcript) {
      if (step === 1) setProfile(prev => ({ ...prev, location: transcript }));
      if (step === 2) setProfile(prev => ({ ...prev, crop: transcript }));
      if (step === 3) setProfile(prev => ({ ...prev, stage: transcript }));
      // Optional: Auto-clear transcript after applying
      // resetTranscript(); 
    }
  }, [transcript, step]);

  const handleNext = () => {
    resetTranscript();
    if (step < 3) setStep(step + 1);
    else onComplete(profile);
  };

  const VoiceButton = () => (
    <button 
      onClick={startListening}
      className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700'}`}
      title="Tap to Speak"
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="flex flex-col h-full justify-center p-6 space-y-8 max-w-md mx-auto w-full">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-green-800">KisanSahayak</h1>
        <p className="text-green-600 text-lg">Your Farm, Our Guidance</p>
        
        {/* Language Selector for Voice */}
        <div className="flex justify-center gap-2 mt-2">
           {Object.values(Language).map((lang) => (
             <button 
               key={lang}
               onClick={() => setLanguage(lang)}
               className={`text-xs px-2 py-1 rounded border ${language === lang ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300'}`}
             >
               {lang}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-green-100">
        
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between text-green-700 mb-4">
               <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8" />
                  <h2 className="text-xl font-semibold">Where is your farm?</h2>
               </div>
               <VoiceButton />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Type or Speak Location</label>
              <input 
                type="text"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.location}
                placeholder="e.g., Pune, Maharashtra"
                onChange={(e) => setProfile({...profile, location: e.target.value})}
              />
              <p className="text-xs text-gray-500">Tap the mic to speak in {language}</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between text-green-700 mb-4">
               <div className="flex items-center gap-3">
                 <Sprout className="w-8 h-8" />
                 <h2 className="text-xl font-semibold">What are you growing?</h2>
               </div>
               <VoiceButton />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Crop Name</label>
              <input
                type="text" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.crop}
                placeholder="e.g., Cotton, Wheat"
                onChange={(e) => setProfile({...profile, crop: e.target.value})}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between text-green-700 mb-4">
               <div className="flex items-center gap-3">
                 <Calendar className="w-8 h-8" />
                 <h2 className="text-xl font-semibold">Current Crop Stage?</h2>
               </div>
               <VoiceButton />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Stage</label>
              <select 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={profile.stage}
                onChange={(e) => setProfile({...profile, stage: e.target.value})}
              >
                <option value="Sowing / Planting">Sowing / Planting</option>
                <option value="Vegetative Growth">Vegetative Growth</option>
                <option value="Flowering">Flowering</option>
                <option value="Harvesting">Harvesting</option>
              </select>
               <p className="text-xs text-gray-500">Or describe it using voice (it will try to select closest match if implemented, or just use text).</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4">
          <Button fullWidth onClick={handleNext} icon={<CheckCircle />}>
            {step === 3 ? "Start Advisories" : "Next"}
          </Button>
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 w-2 rounded-full ${step >= i ? 'bg-green-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};