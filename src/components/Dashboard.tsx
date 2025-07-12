import React, { useState, useEffect } from 'react';
import { Power, Download, RefreshCw, TrendingUp, TrendingDown, Zap, CreditCard, BarChart3 } from 'lucide-react';

interface DashboardProps {
  user: {
    name: string;
    compteur: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [serviceStatus, setServiceStatus] = useState<'active' | 'inactive'>('active');
  const [lastCheck, setLastCheck] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [billStatus, setBillStatus] = useState<'unpaid' | 'paid' | 'paying'>('unpaid');
  const [consumption, setConsumption] = useState({ current: 245, limit: 300, unit: 'kWh' });
  const [comparison, setComparison] = useState({ value: 15, trend: 'up' });

  const refreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastCheck(new Date());
      setIsRefreshing(false);
    }, 2000);
  };

  const payBill = () => {
    setBillStatus('paying');
    setTimeout(() => {
      setBillStatus('paid');
    }, 3000);
  };

  const toggleUnit = () => {
    if (consumption.unit === 'kWh') {
      setConsumption(prev => ({ ...prev, unit: 'XAF', current: prev.current * 150, limit: prev.limit * 150 }));
    } else {
      setConsumption(prev => ({ ...prev, unit: 'kWh', current: Math.round(prev.current / 150), limit: Math.round(prev.limit / 150) }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative pt-32">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Bonjour, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-blue-100 text-sm">Compteur: {user.compteur}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">{user.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 relative z-10">
        {/* Service Status Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-xl border border-white/20 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${serviceStatus === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Power className={`w-6 h-6 ${serviceStatus === 'active' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">État du Service</h3>
                <p className={`text-sm font-medium ${serviceStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {serviceStatus === 'active' ? 'Service Actif' : 'Service Interrompu'}
                </p>
              </div>
            </div>
            <button
              onClick={refreshStatus}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Vérifié à {lastCheck.toLocaleTimeString('fr-FR')}
          </p>
        </div>

        {/* Bill Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-xl border border-white/20 animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900 mr-2">Ma Dernière Facture</h3>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-gray-900">25,430 XAF</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            {billStatus === 'unpaid' && (
              <button
                onClick={payBill}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 active:scale-98 transform"
              >
                Payer Maintenant
              </button>
            )}
            {billStatus === 'paying' && (
              <div className="w-full bg-gray-200 rounded-xl p-3">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-gray-700">Traitement en cours...</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
            {billStatus === 'paid' && (
              <div className="w-full bg-green-100 border border-green-200 rounded-xl p-3 flex items-center justify-center">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-green-700 font-medium">Facture Payée</span>
              </div>
            )}
          </div>
        </div>

        {/* Consumption Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Suivi de Consommation</h3>
                <button
                  onClick={toggleUnit}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir en {consumption.unit === 'kWh' ? 'XAF' : 'kWh'}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{consumption.current} {consumption.unit}</span>
              <span>{consumption.limit} {consumption.unit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out animate-fill-bar"
                style={{ width: `${(consumption.current / consumption.limit) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center text-sm">
            {comparison.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            )}
            <span className={`font-medium ${comparison.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
              {comparison.value}% {comparison.trend === 'up' ? 'de plus' : 'de moins'}
            </span>
            <span className="text-gray-600 ml-1">que le mois dernier à la même date</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;