import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, MessageCircle, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', label: 'Accueil', icon: Home, path: '/dashboard' },
    { id: 'incidents', label: 'Carte', icon: Map, path: '/incidents' },
    { id: 'support', label: 'Support', icon: MessageCircle, path: '/support' },
    { id: 'profile', label: 'Profil', icon: User, path: '/profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 transform ${
                active 
                  ? 'text-blue-600 bg-blue-50 scale-105' 
                  : 'text-gray-500 hover:text-gray-700 active:scale-95'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'text-blue-600' : ''}`} />
              <span className={`text-xs font-medium ${active ? 'text-blue-600' : ''}`}>
                {tab.label}
              </span>
              {active && (
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-1 animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;