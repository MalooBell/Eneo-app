import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Edit3,
  Fingerprint,
  Mail,
  Phone,
  Lock
} from 'lucide-react';

interface ProfileProps {
  user: {
    name: string;
    compteur: string;
    email: string;
    phone: string;
  };
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState({
    billing: true,
    outages: true,
    promotions: false
  });
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('eneo_biometric') === 'true'
  );
  const [language, setLanguage] = useState('fr');

  const handleNotificationToggle = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleBiometricToggle = () => {
    const newValue = !biometricEnabled;
    setBiometricEnabled(newValue);
    localStorage.setItem('eneo_biometric', newValue.toString());
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
        <h1 className="text-xl font-bold mb-6">Profil</h1>
        
        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-blue-100 text-sm">Compteur: {user.compteur}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informations Personnelles
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Edit3 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Téléphone</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Edit3 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Sécurité
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center">
                <Lock className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Modifier le mot de passe</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <Fingerprint className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Connexion biométrique</span>
              </div>
              <button
                onClick={handleBiometricToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  biometricEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Préférences de Notification
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-900">Alertes de Facturation</span>
              <button
                onClick={() => handleNotificationToggle('billing')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.billing ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.billing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-900">Infos Pannes & Maintenance</span>
              <button
                onClick={() => handleNotificationToggle('outages')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.outages ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.outages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-900">Actualités et promotions</span>
              <button
                onClick={() => handleNotificationToggle('promotions')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.promotions ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.promotions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Language & Support */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-4 space-y-4">
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center">
                <Globe className="w-4 h-4 text-gray-500 mr-3" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Langue</p>
                  <p className="text-sm text-gray-600">Français</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center">
                <HelpCircle className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Aide & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;