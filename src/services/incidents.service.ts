/**
 * Service de gestion des incidents et pannes
 */

import { apiClient } from './api';
import { storageService } from './storage.service';

export interface Incident {
  id: string;
  type: 'outage' | 'maintenance';
  title: string;
  description: string;
  location: string;
  address: string;
  duration: string;
  estimatedResolution?: Date;
  affectedUsers: number;
  lat: number;
  lng: number;
  status: 'active' | 'resolved' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceStatus {
  status: 'active' | 'inactive' | 'maintenance';
  lastCheck: Date;
  uptime: number; // Pourcentage
  nextMaintenance?: Date;
}

export interface IncidentNotification {
  incidentId: string;
  userId: string;
  enabled: boolean;
  createdAt: Date;
}

class IncidentsService {
  private readonly INCIDENTS_CACHE_KEY = 'incidents_data';
  private readonly SERVICE_STATUS_CACHE_KEY = 'service_status';
  private readonly NOTIFICATIONS_CACHE_KEY = 'incident_notifications';

  async getIncidents(userLocation?: { lat: number; lng: number }): Promise<Incident[]> {
    try {
      // Vérifier le cache
      const cached = await storageService.getCachedData<Incident[]>(this.INCIDENTS_CACHE_KEY);
      if (cached) {
        return cached;
      }

      // TODO: Vraie API avec géolocalisation
      // const response = await apiClient.get<Incident[]>('/incidents', {
      //   params: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : {}
      // });

      // Données simulées géolocalisées au Cameroun
      const incidents: Incident[] = [
        {
          id: '1',
          type: 'outage',
          title: 'Panne Électrique Secteur',
          description: 'Coupure générale suite à un problème technique sur le transformateur principal du quartier.',
          location: 'Quartier Bastos',
          address: 'Bastos, Yaoundé, Cameroun',
          duration: 'Depuis 14:30',
          estimatedResolution: new Date(Date.now() + 3 * 60 * 60 * 1000), // Dans 3h
          affectedUsers: 1250,
          lat: 3.8667,
          lng: 11.5167,
          status: 'active',
          priority: 'high',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // Il y a 4h
          updatedAt: new Date(Date.now() - 30 * 60 * 1000) // Il y a 30min
        },
        {
          id: '2',
          type: 'maintenance',
          title: 'Maintenance Programmée',
          description: 'Travaux de maintenance préventive sur le réseau haute tension pour améliorer la stabilité.',
          location: 'Akwa',
          address: 'Akwa, Douala, Cameroun',
          duration: 'Demain 08:00 - 12:00',
          affectedUsers: 800,
          lat: 4.0511,
          lng: 9.7679,
          status: 'scheduled',
          priority: 'medium',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'outage',
          title: 'Panne Locale',
          description: 'Interruption due à des travaux routiers ayant endommagé une ligne électrique.',
          location: 'Mendong',
          address: 'Mendong, Yaoundé, Cameroun',
          duration: 'Depuis 16:45',
          estimatedResolution: new Date(Date.now() + 2 * 60 * 60 * 1000),
          affectedUsers: 650,
          lat: 3.8480,
          lng: 11.4914,
          status: 'active',
          priority: 'medium',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: '4',
          type: 'maintenance',
          title: 'Mise à Niveau Réseau',
          description: 'Installation de nouveaux équipements pour améliorer la capacité et la fiabilité du réseau.',
          location: 'Bonapriso',
          address: 'Bonapriso, Douala, Cameroun',
          duration: 'Samedi 06:00 - 14:00',
          affectedUsers: 1100,
          lat: 4.0469,
          lng: 9.7069,
          status: 'scheduled',
          priority: 'low',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
        }
      ];

      // Si une position utilisateur est fournie, trier par distance
      if (userLocation) {
        incidents.sort((a, b) => {
          const distA = this.calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
          const distB = this.calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
          return distA - distB;
        });
      }

      // Cache pour 15 minutes
      await storageService.setCachedData(this.INCIDENTS_CACHE_KEY, incidents, 0.25);
      
      return incidents;
    } catch (error) {
      console.error('Erreur récupération incidents:', error);
      throw new Error('Impossible de récupérer les incidents');
    }
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const incidents = await this.getIncidents();
      return incidents.find(incident => incident.id === id) || null;
    } catch (error) {
      console.error('Erreur récupération incident:', error);
      return null;
    }
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    try {
      // Vérifier le cache
      const cached = await storageService.getCachedData<ServiceStatus>(this.SERVICE_STATUS_CACHE_KEY);
      if (cached) {
        return cached;
      }

      // TODO: Vraie API
      // const response = await apiClient.get<ServiceStatus>('/service/status');

      // Données simulées
      const status: ServiceStatus = {
        status: 'active',
        lastCheck: new Date(),
        uptime: 98.5,
        nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans 7 jours
      };

      // Cache pour 5 minutes
      await storageService.setCachedData(this.SERVICE_STATUS_CACHE_KEY, status, 0.083);
      
      return status;
    } catch (error) {
      console.error('Erreur statut service:', error);
      throw new Error('Impossible de vérifier le statut du service');
    }
  }

  async refreshServiceStatus(): Promise<ServiceStatus> {
    // Forcer le rafraîchissement en supprimant le cache
    await storageService.setCachedData(this.SERVICE_STATUS_CACHE_KEY, null, 0);
    return await this.getServiceStatus();
  }

  async subscribeToIncidentNotifications(incidentId: string): Promise<void> {
    try {
      // TODO: Vraie API
      // await apiClient.post('/incidents/notifications/subscribe', { incidentId });

      // Sauvegarder localement
      const notifications = await this.getIncidentNotifications();
      const newNotification: IncidentNotification = {
        incidentId,
        userId: 'current_user', // À remplacer par l'ID utilisateur réel
        enabled: true,
        createdAt: new Date()
      };

      notifications.push(newNotification);
      await storageService.setCachedData(this.NOTIFICATIONS_CACHE_KEY, notifications, 24 * 7); // 7 jours
    } catch (error) {
      console.error('Erreur abonnement notifications:', error);
      throw new Error('Impossible de s\'abonner aux notifications');
    }
  }

  async unsubscribeFromIncidentNotifications(incidentId: string): Promise<void> {
    try {
      // TODO: Vraie API
      // await apiClient.post('/incidents/notifications/unsubscribe', { incidentId });

      // Supprimer localement
      const notifications = await this.getIncidentNotifications();
      const filtered = notifications.filter(n => n.incidentId !== incidentId);
      await storageService.setCachedData(this.NOTIFICATIONS_CACHE_KEY, filtered, 24 * 7);
    } catch (error) {
      console.error('Erreur désabonnement notifications:', error);
      throw new Error('Impossible de se désabonner des notifications');
    }
  }

  async getIncidentNotifications(): Promise<IncidentNotification[]> {
    const notifications = await storageService.getCachedData<IncidentNotification[]>(this.NOTIFICATIONS_CACHE_KEY);
    return notifications || [];
  }

  async isSubscribedToIncident(incidentId: string): Promise<boolean> {
    const notifications = await this.getIncidentNotifications();
    return notifications.some(n => n.incidentId === incidentId && n.enabled);
  }

  async searchIncidentsByAddress(address: string): Promise<Incident[]> {
    try {
      // TODO: Géocodage et recherche par proximité
      // const geocoded = await this.geocodeAddress(address);
      // return await this.getIncidents(geocoded);

      // Pour l'instant, filtrer par nom de lieu
      const incidents = await this.getIncidents();
      return incidents.filter(incident => 
        incident.location.toLowerCase().includes(address.toLowerCase()) ||
        incident.address.toLowerCase().includes(address.toLowerCase())
      );
    } catch (error) {
      console.error('Erreur recherche incidents:', error);
      return [];
    }
  }

  // Méthodes utilitaires
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  getIncidentStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'En cours';
      case 'resolved':
        return 'Résolu';
      case 'scheduled':
        return 'Programmé';
      default:
        return status;
    }
  }

  getIncidentTypeLabel(type: string): string {
    switch (type) {
      case 'outage':
        return 'Panne';
      case 'maintenance':
        return 'Maintenance';
      default:
        return type;
    }
  }

  getIncidentPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  formatDuration(incident: Incident): string {
    if (incident.status === 'scheduled') {
      return incident.duration;
    }

    const now = new Date();
    const created = new Date(incident.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Depuis ${diffHours}h${diffMinutes > 0 ? diffMinutes + 'min' : ''}`;
    } else {
      return `Depuis ${diffMinutes}min`;
    }
  }

  getEstimatedResolutionText(incident: Incident): string | null {
    if (!incident.estimatedResolution) return null;

    const now = new Date();
    const resolution = new Date(incident.estimatedResolution);
    const diffMs = resolution.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Résolution imminente';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Résolution estimée dans ${diffHours}h${diffMinutes > 0 ? diffMinutes + 'min' : ''}`;
    } else {
      return `Résolution estimée dans ${diffMinutes}min`;
    }
  }
}

export const incidentsService = new IncidentsService();