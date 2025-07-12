import React, { useState } from 'react';
import { Eye, EyeOff, Fingerprint, Shield } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (credentials: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [compteur, setCompteur] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showBiometric, setShowBiometric] = useState(localStorage.getItem('eneo_biometric') === 'true');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ compteur, password });
    
    if (rememberMe && !showBiometric) {
      const enable = window.confirm('Voulez-vous activer la connexion biométrique pour les prochaines fois ?');
      if (enable) {
        localStorage.setItem('eneo_biometric', 'true');
      }
    }
  };

  const handleBiometricLogin = () => {
    // Simulate biometric authentication
    setTimeout(() => {
      onLogin({ biometric: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232E6DB4' fill-opacity='1'%3E%3Cpath d='M30 5l10 20h-20z'/%3E%3Ccircle cx='30' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-slide-up">
          <div className="w-24 h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl transform rotate-6"></div>
            <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">ENEO</div>
                <div className="w-6 h-0.5 bg-green-500 mx-auto rounded-full"></div>
                <div className="text-xs text-gray-600">CAMEROON</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-center text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
          Connexion
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8 animate-fade-in delay-100">
          Accédez à votre espace client Eneo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/20 animate-slide-up delay-200">
          {showBiometric && (
            <div className="mb-6">
              <button
                onClick={handleBiometricLogin}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md active:scale-98"
              >
                <Fingerprint className="w-5 h-5 mr-2 text-blue-600" />
                Connexion biométrique
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="compteur" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de compteur
              </label>
              <input
                id="compteur"
                name="compteur"
                type="text"
                required
                value={compteur}
                onChange={(e) => setCompteur(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:z-10 transition-all duration-200"
                placeholder="Entrez votre numéro"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:z-10 transition-all duration-200"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform active:scale-98 hover:shadow-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;