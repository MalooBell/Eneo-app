import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="relative mb-8">
          {/* Eneo Logo Simulation */}
          <div className="w-32 h-32 mx-auto relative animate-zoom-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl transform rotate-12"></div>
            <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">ENEO</div>
                <div className="w-8 h-1 bg-green-500 mx-auto rounded-full"></div>
                <div className="text-xs text-gray-600 mt-1">CAMEROON</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;