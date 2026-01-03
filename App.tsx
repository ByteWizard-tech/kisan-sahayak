import React, { useState } from 'react';
import { Onboarding } from './components/Onboarding';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ExtensionDashboard } from './components/ExtensionDashboard';
import { FarmerProfile, UserRole } from './types';
import { Sprout, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);

  const handleFarmerLogin = (p: FarmerProfile) => {
    setProfile(p);
    setRole(UserRole.FARMER);
  };

  const handleOfficerLogin = () => {
    setRole(UserRole.EXTENSION_OFFICER);
  };

  // Render View Logic
  const renderContent = () => {
    if (!role) {
      // Landing / Role Selection
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
          <div className="text-center mb-12 space-y-4">
             <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <Sprout className="w-12 h-12 text-green-600" />
             </div>
             <h1 className="text-4xl font-bold text-gray-800">KisanSahayak</h1>
             <p className="text-gray-600 text-lg max-w-xs mx-auto">Climate Resilient Crop Advisory Platform</p>
          </div>

          <div className="grid gap-6 w-full max-w-sm">
            <button 
              onClick={() => setRole(UserRole.FARMER)}
              className="flex flex-col items-center p-6 bg-white border-2 border-green-100 rounded-2xl shadow-sm hover:shadow-md hover:border-green-500 transition-all group"
            >
              <span className="text-xl font-bold text-gray-800 group-hover:text-green-700">I am a Farmer</span>
              <span className="text-sm text-gray-500">Get crop advice & weather alerts</span>
            </button>

            <button 
              onClick={handleOfficerLogin}
              className="flex flex-col items-center p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
            >
               <span className="text-xl font-bold text-gray-800 group-hover:text-blue-700">Extension Officer</span>
               <span className="text-sm text-gray-500">Monitor region & send alerts</span>
            </button>
          </div>
        </div>
      );
    }

    if (role === UserRole.FARMER) {
      if (!profile) {
        return <Onboarding onComplete={handleFarmerLogin} />;
      }
      return <FarmerDashboard profile={profile} logout={() => { setRole(null); setProfile(null); }} />;
    }

    if (role === UserRole.EXTENSION_OFFICER) {
      return (
        <div>
           <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
              <span className="font-bold text-gray-600 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4"/> Officer Panel
              </span>
              <button onClick={() => setRole(null)} className="text-sm text-red-500 font-medium">Logout</button>
           </div>
           <ExtensionDashboard />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {renderContent()}
    </div>
  );
}