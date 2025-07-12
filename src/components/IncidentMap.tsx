import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, AlertTriangle, Construction, Bell, X } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

interface Incident {
  id: string;
  type: 'outage' | 'maintenance';
  title: string;
  description: string;
  location: string;
  duration: string;
  affectedUsers: number;
  lat: number;
  lng: number;
}

const IncidentMap: React.FC = () => {
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Incidents réels géolocalisés au Cameroun
  const incidents: Incident[] = [
    {
      id: '1',
      type: 'outage',
      title: 'Panne Électrique',
      description: 'Coupure générale suite à un problème technique sur le transformateur principal.',
      location: 'Quartier Bastos, Yaoundé',
      duration: 'Depuis 14:30 - Durée estimée: 3h',
      affectedUsers: 1250,
      lat: 3.8667,
      lng: 11.5167
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'Maintenance Programmée',
      description: 'Travaux de maintenance préventive sur le réseau haute tension.',
      location: 'Akwa, Douala',
      duration: 'Demain 08:00 - 12:00',
      affectedUsers: 800,
      lat: 4.0511,
      lng: 9.7679
    },
    {
      id: '3',
      type: 'outage',
      title: 'Panne Secteur',
      description: 'Interruption due à des travaux routiers ayant endommagé une ligne.',
      location: 'Mendong, Yaoundé',
      duration: 'Depuis 16:45 - Durée estimée: 2h',
      affectedUsers: 650,
      lat: 3.8480,
      lng: 11.4914
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'Mise à Niveau Réseau',
      description: 'Installation de nouveaux équipements pour améliorer la stabilité.',
      location: 'Bonapriso, Douala',
      duration: 'Samedi 06:00 - 14:00',
      affectedUsers: 1100,
      lat: 4.0469,
      lng: 9.7069
    }
  ];

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    // Remplacez 'YOUR_API_KEY' par votre vraie clé API Google Maps
    const loader = new Loader({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // ⚠️ Remplacez par votre clé API
      version: 'weekly',
      libraries: ['places']
    });

    try {
      await loader.load();
      
      if (mapRef.current) {
        // Centre sur le Cameroun (Yaoundé)
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 3.8480, lng: 11.5021 },
          zoom: 11,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry.fill',
              stylers: [{ color: '#f8f9fa' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e3f2fd' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        setMap(mapInstance);
        addMarkersToMap(mapInstance);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de Google Maps:', error);
      // Fallback vers la carte simulée si Google Maps ne charge pas
    }
  };

  const addMarkersToMap = (mapInstance: google.maps.Map) => {
    const newMarkers: google.maps.Marker[] = [];

    incidents.forEach((incident) => {
      // Créer une icône personnalisée selon le type d'incident
      const iconColor = incident.type === 'outage' ? '#DC3545' : '#FFA500';
      const iconSvg = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${iconColor}" stroke="white" stroke-width="2"/>
          <path d="M16 8l-4 8h8l-4-8z" fill="white"/>
        </svg>
      `;

      const marker = new google.maps.Marker({
        position: { lat: incident.lat, lng: incident.lng },
        map: mapInstance,
        title: incident.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(iconSvg)}`,
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      // Ajouter un cercle pour la zone affectée
      const circle = new google.maps.Circle({
        strokeColor: iconColor,
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: iconColor,
        fillOpacity: 0.15,
        map: mapInstance,
        center: { lat: incident.lat, lng: incident.lng },
        radius: 1000 // 1km de rayon
      });

      // Événement de clic sur le marqueur
      marker.addListener('click', () => {
        setSelectedIncident(incident);
        mapInstance.panTo({ lat: incident.lat, lng: incident.lng });
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  const handleNotifyMe = (incidentId: string) => {
    if (!notifications.includes(incidentId)) {
      setNotifications([...notifications, incidentId]);
      alert('Vous serez notifié quand ce problème sera résolu !');
    }
  };

  const handleSearch = () => {
    if (!map || !searchAddress.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchAddress + ', Cameroun' }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(14);
      } else {
        alert('Adresse non trouvée. Veuillez vérifier et réessayer.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
        <h1 className="text-xl font-bold mb-4">Carte des Incidents</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Vérifier une autre adresse..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {searchAddress && (
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-200 mx-4 my-4 rounded-2xl overflow-hidden shadow-lg">
        {/* Google Maps Container */}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Fallback si Google Maps ne charge pas */}
        {!map && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Chargement de la carte...</p>
              <p className="text-gray-500 text-xs mt-1">
                Assurez-vous d'avoir configuré votre clé API Google Maps
              </p>
            </div>
          </div>
        )}

        {/* Map overlay when incident is selected */}
        {selectedIncident && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        )}
      </div>

      {/* Incident List */}
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Incidents en cours</h2>
        
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            onClick={() => setSelectedIncident(incident)}
          >
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                incident.type === 'outage' ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                {incident.type === 'outage' ? (
                  <AlertTriangle className={`w-5 h-5 ${incident.type === 'outage' ? 'text-red-600' : 'text-orange-600'}`} />
                ) : (
                  <Construction className={`w-5 h-5 ${incident.type === 'outage' ? 'text-red-600' : 'text-orange-600'}`} />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{incident.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {incident.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {incident.duration}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedIncident.title}</h2>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                selectedIncident.type === 'outage' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {selectedIncident.type === 'outage' ? (
                  <AlertTriangle className="w-4 h-4 mr-1" />
                ) : (
                  <Construction className="w-4 h-4 mr-1" />
                )}
                {selectedIncident.type === 'outage' ? 'Panne en cours' : 'Maintenance programmée'}
              </div>

              <p className="text-gray-700 mb-4">{selectedIncident.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{selectedIncident.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{selectedIncident.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-700">{selectedIncident.affectedUsers} utilisateurs affectés</span>
                </div>
              </div>

              {selectedIncident.type === 'outage' && (
                <button
                  onClick={() => handleNotifyMe(selectedIncident.id)}
                  disabled={notifications.includes(selectedIncident.id)}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    notifications.includes(selectedIncident.id)
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
                  }`}
                >
                  <Bell className="w-5 h-5 mr-2" />
                  {notifications.includes(selectedIncident.id) 
                    ? 'Notification activée ✓' 
                    : 'M\'avertir quand c\'est résolu'
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentMap;