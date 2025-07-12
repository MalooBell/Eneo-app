/**
 * Point d'entrée centralisé pour tous les services
 */

// Services principaux
export { apiClient } from './api';
export { authService } from './auth.service';
export { storageService } from './storage.service';
export { biometricService } from './biometric.service';
export { consumptionService } from './consumption.service';
export { incidentsService } from './incidents.service';
export { supportService } from './support.service';
export { notificationsService } from './notifications.service';

// Types exportés
export type { ApiResponse, ApiError } from './api';
export type { LoginCredentials, User, AuthResponse } from './auth.service';
export type { BiometricResult, BiometricInfo } from './biometric.service';
export type { 
  ConsumptionData, 
  ConsumptionHistory, 
  ConsumptionComparison, 
  BillData 
} from './consumption.service';
export type { 
  Incident, 
  ServiceStatus, 
  IncidentNotification 
} from './incidents.service';
export type { 
  Message, 
  Ticket, 
  Agent, 
  ChatSession, 
  BotResponse 
} from './support.service';
export type { 
  NotificationPayload, 
  NotificationPreferences, 
  PushNotificationToken 
} from './notifications.service';

/**
 * Configuration globale des services
 */
export class ServicesConfig {
  static async initialize(): Promise<void> {
    try {
      console.log('🚀 Initialisation des services Eneo...');
      
      // Vérifier l'authentification au démarrage
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        console.log('✅ Utilisateur authentifié');
        await authService.getCurrentUser();
      }
      
      // Initialiser les notifications si permission accordée
      const notifPermission = await notificationsService.isPermissionGranted();
      if (notifPermission) {
        console.log('✅ Notifications activées');
      }
      
      console.log('✅ Services initialisés avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation services:', error);
    }
  }

  static async cleanup(): Promise<void> {
    try {
      console.log('🧹 Nettoyage des services...');
      
      // Nettoyer les caches expirés
      await storageService.clearCache();
      
      console.log('✅ Nettoyage terminé');
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  }
}

/**
 * Hook React pour utiliser les services (optionnel)
 */
export const useServices = () => {
  return {
    auth: authService,
    storage: storageService,
    biometric: biometricService,
    consumption: consumptionService,
    incidents: incidentsService,
    support: supportService,
    notifications: notificationsService
  };
};

/**
 * Utilitaires pour la gestion d'erreurs
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const handleServiceError = (error: any, serviceName: string): ServiceError => {
  if (error instanceof ServiceError) {
    return error;
  }
  
  return new ServiceError(
    error.message || 'Erreur inconnue',
    serviceName,
    error.code,
    error
  );
};

/**
 * Configuration des variables d'environnement
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.eneo.cm',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV
};

console.log('📦 Services Eneo chargés:', {
  environment: ENV.ENVIRONMENT,
  version: ENV.APP_VERSION,
  apiUrl: ENV.API_BASE_URL
});