/**
 * Service d'authentification
 * Gère la connexion, déconnexion, et l'état d'authentification
 */

import { apiClient, ApiResponse } from './api';
import { storageService } from './storage.service';
import { biometricService } from './biometric.service';

export interface LoginCredentials {
  compteur: string;
  password: string;
}

export interface BiometricLoginData {
  biometric: boolean;
}

export interface User {
  id: string;
  name: string;
  compteur: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // TODO: Remplacer par vraie API
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          name: 'Paul Ngando',
          compteur: credentials.compteur,
          email: 'paul.ngando@email.com',
          phone: '+237 6XX XX XX XX'
        },
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      };

      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vraie implémentation future :
      // const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      // const authData = response.data;

      await this.setAuthData(mockResponse);
      return mockResponse;

    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw new Error('Identifiants incorrects');
    }
  }

  async loginWithBiometric(): Promise<AuthResponse> {
    try {
      const isAvailable = await biometricService.isAvailable();
      if (!isAvailable) {
        throw new Error('Authentification biométrique non disponible');
      }

      const result = await biometricService.authenticate();
      if (!result.success) {
        throw new Error('Authentification biométrique échouée');
      }

      // Récupérer les credentials stockés
      const savedCredentials = await storageService.getBiometricCredentials();
      if (!savedCredentials) {
        throw new Error('Aucune donnée biométrique sauvegardée');
      }

      return await this.login(savedCredentials);

    } catch (error) {
      console.error('Erreur connexion biométrique:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // TODO: Appel API de déconnexion
      // await apiClient.post('/auth/logout');

      await this.clearAuthData();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      // Nettoyer quand même les données locales
      await this.clearAuthData();
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = await storageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      // TODO: Vraie API
      // const response = await apiClient.post<{token: string}>('/auth/refresh', {
      //   refreshToken
      // });
      // const newToken = response.data.token;

      const newToken = 'new_mock_token_' + Date.now();
      
      await storageService.setAuthToken(newToken);
      apiClient.setAuthToken(newToken);
      this.authToken = newToken;

      return newToken;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      await this.logout();
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storageService.getAuthToken();
      if (!token) return false;

      // TODO: Vérifier la validité du token avec l'API
      // const response = await apiClient.get('/auth/verify');
      // return response.success;

      this.authToken = token;
      apiClient.setAuthToken(token);
      return true;
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const userData = await storageService.getUserData();
      if (userData) {
        this.currentUser = userData;
        return userData;
      }

      // TODO: Récupérer depuis l'API si pas en cache
      // const response = await apiClient.get<User>('/auth/me');
      // this.currentUser = response.data;
      // await storageService.setUserData(this.currentUser);

      return null;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  private async setAuthData(authData: AuthResponse): Promise<void> {
    this.currentUser = authData.user;
    this.authToken = authData.token;

    apiClient.setAuthToken(authData.token);
    
    await Promise.all([
      storageService.setAuthToken(authData.token),
      storageService.setRefreshToken(authData.refreshToken),
      storageService.setUserData(authData.user),
      storageService.setAuthStatus(true)
    ]);
  }

  private async clearAuthData(): Promise<void> {
    this.currentUser = null;
    this.authToken = null;

    apiClient.clearAuthToken();
    
    await Promise.all([
      storageService.clearAuthToken(),
      storageService.clearRefreshToken(),
      storageService.clearUserData(),
      storageService.setAuthStatus(false)
    ]);
  }

  // Getters pour l'état actuel
  get user(): User | null {
    return this.currentUser;
  }

  get token(): string | null {
    return this.authToken;
  }
}

export const authService = new AuthService();