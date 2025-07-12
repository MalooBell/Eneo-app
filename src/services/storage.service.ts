/**
 * Service de stockage sécurisé
 * Utilise localStorage pour le web, et Capacitor SecureStorage pour mobile
 */

import { LoginCredentials, User } from './auth.service';

// Interface pour Capacitor SecureStorage (sera disponible après installation)
interface SecureStorage {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
  remove(options: { key: string }): Promise<void>;
  clear(): Promise<void>;
}

class StorageService {
  private isCapacitor = false;
  private secureStorage: SecureStorage | null = null;

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // Vérifier si Capacitor est disponible
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        this.isCapacitor = true;
        // Import dynamique de Capacitor SecureStorage
        const { SecureStorage } = await import('@capacitor/secure-storage');
        this.secureStorage = SecureStorage;
      }
    } catch (error) {
      console.log('Capacitor non disponible, utilisation localStorage');
      this.isCapacitor = false;
    }
  }

  private async secureGet(key: string): Promise<string | null> {
    if (this.isCapacitor && this.secureStorage) {
      try {
        const result = await this.secureStorage.get({ key });
        return result.value;
      } catch (error) {
        console.error(`Erreur lecture sécurisée ${key}:`, error);
        return null;
      }
    } else {
      return localStorage.getItem(key);
    }
  }

  private async secureSet(key: string, value: string): Promise<void> {
    if (this.isCapacitor && this.secureStorage) {
      try {
        await this.secureStorage.set({ key, value });
      } catch (error) {
        console.error(`Erreur écriture sécurisée ${key}:`, error);
        // Fallback vers localStorage
        localStorage.setItem(key, value);
      }
    } else {
      localStorage.setItem(key, value);
    }
  }

  private async secureRemove(key: string): Promise<void> {
    if (this.isCapacitor && this.secureStorage) {
      try {
        await this.secureStorage.remove({ key });
      } catch (error) {
        console.error(`Erreur suppression sécurisée ${key}:`, error);
      }
    } else {
      localStorage.removeItem(key);
    }
  }

  // Méthodes d'authentification
  async getAuthToken(): Promise<string | null> {
    return await this.secureGet('eneo_auth_token');
  }

  async setAuthToken(token: string): Promise<void> {
    await this.secureSet('eneo_auth_token', token);
  }

  async clearAuthToken(): Promise<void> {
    await this.secureRemove('eneo_auth_token');
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.secureGet('eneo_refresh_token');
  }

  async setRefreshToken(token: string): Promise<void> {
    await this.secureSet('eneo_refresh_token', token);
  }

  async clearRefreshToken(): Promise<void> {
    await this.secureRemove('eneo_refresh_token');
  }

  // Données utilisateur
  async getUserData(): Promise<User | null> {
    const userData = await this.secureGet('eneo_user_data');
    return userData ? JSON.parse(userData) : null;
  }

  async setUserData(user: User): Promise<void> {
    await this.secureSet('eneo_user_data', JSON.stringify(user));
  }

  async clearUserData(): Promise<void> {
    await this.secureRemove('eneo_user_data');
  }

  // État d'authentification
  async getAuthStatus(): Promise<boolean> {
    const status = await this.secureGet('eneo_auth_status');
    return status === 'true';
  }

  async setAuthStatus(isAuthenticated: boolean): Promise<void> {
    await this.secureSet('eneo_auth_status', isAuthenticated.toString());
  }

  // Données biométriques
  async getBiometricCredentials(): Promise<LoginCredentials | null> {
    const credentials = await this.secureGet('eneo_biometric_credentials');
    return credentials ? JSON.parse(credentials) : null;
  }

  async setBiometricCredentials(credentials: LoginCredentials): Promise<void> {
    await this.secureSet('eneo_biometric_credentials', JSON.stringify(credentials));
  }

  async clearBiometricCredentials(): Promise<void> {
    await this.secureRemove('eneo_biometric_credentials');
  }

  async getBiometricEnabled(): Promise<boolean> {
    const enabled = await this.secureGet('eneo_biometric_enabled');
    return enabled === 'true';
  }

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.secureSet('eneo_biometric_enabled', enabled.toString());
  }

  // Préférences utilisateur
  async getNotificationPreferences(): Promise<any> {
    const prefs = await this.secureGet('eneo_notification_prefs');
    return prefs ? JSON.parse(prefs) : {
      billing: true,
      outages: true,
      promotions: false
    };
  }

  async setNotificationPreferences(preferences: any): Promise<void> {
    await this.secureSet('eneo_notification_prefs', JSON.stringify(preferences));
  }

  async getLanguage(): Promise<string> {
    const lang = await this.secureGet('eneo_language');
    return lang || 'fr';
  }

  async setLanguage(language: string): Promise<void> {
    await this.secureSet('eneo_language', language);
  }

  // Cache des données
  async getCachedData<T>(key: string): Promise<T | null> {
    const data = localStorage.getItem(`eneo_cache_${key}`);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      // Vérifier l'expiration (24h par défaut)
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(`eneo_cache_${key}`);
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.error(`Erreur parsing cache ${key}:`, error);
      return null;
    }
  }

  async setCachedData<T>(key: string, data: T, expiryHours: number = 24): Promise<void> {
    const cacheData = {
      data,
      expiry: Date.now() + (expiryHours * 60 * 60 * 1000)
    };
    localStorage.setItem(`eneo_cache_${key}`, JSON.stringify(cacheData));
  }

  async clearCache(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('eneo_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Nettoyage complet
  async clearAll(): Promise<void> {
    if (this.isCapacitor && this.secureStorage) {
      try {
        await this.secureStorage.clear();
      } catch (error) {
        console.error('Erreur nettoyage sécurisé:', error);
      }
    }
    
    // Nettoyer aussi localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('eneo_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const storageService = new StorageService();