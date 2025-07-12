/**
 * Service d'authentification biométrique
 * Utilise les APIs natives via Capacitor
 */

export interface BiometricResult {
  success: boolean;
  error?: string;
}

export interface BiometricInfo {
  isAvailable: boolean;
  biometryType?: 'fingerprint' | 'face' | 'iris' | 'voice';
  strongBiometryIsAvailable: boolean;
}

class BiometricService {
  private isCapacitor = false;
  private biometricAuth: any = null;

  constructor() {
    this.initializeBiometric();
  }

  private async initializeBiometric() {
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        this.isCapacitor = true;
        // Import dynamique de Capacitor Biometric Auth
        const { BiometricAuth } = await import('@capacitor-community/biometric-auth');
        this.biometricAuth = BiometricAuth;
      }
    } catch (error) {
      console.log('Biometric Auth non disponible');
      this.isCapacitor = false;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isCapacitor || !this.biometricAuth) {
      // Simulation pour le web
      return Promise.resolve(true);
    }

    try {
      const result = await this.biometricAuth.checkBiometry();
      return result.isAvailable;
    } catch (error) {
      console.error('Erreur vérification biométrie:', error);
      return false;
    }
  }

  async getBiometricInfo(): Promise<BiometricInfo> {
    if (!this.isCapacitor || !this.biometricAuth) {
      // Simulation pour le web
      return {
        isAvailable: true,
        biometryType: 'fingerprint',
        strongBiometryIsAvailable: true
      };
    }

    try {
      const result = await this.biometricAuth.checkBiometry();
      return {
        isAvailable: result.isAvailable,
        biometryType: result.biometryType,
        strongBiometryIsAvailable: result.strongBiometryIsAvailable
      };
    } catch (error) {
      console.error('Erreur info biométrie:', error);
      return {
        isAvailable: false,
        strongBiometryIsAvailable: false
      };
    }
  }

  async authenticate(reason?: string): Promise<BiometricResult> {
    if (!this.isCapacitor || !this.biometricAuth) {
      // Simulation pour le web
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simuler une authentification réussie
          resolve({ success: true });
        }, 1000);
      });
    }

    try {
      await this.biometricAuth.authenticate({
        reason: reason || 'Authentifiez-vous pour accéder à votre compte Eneo',
        title: 'Authentification Eneo',
        subtitle: 'Utilisez votre empreinte digitale ou Face ID',
        description: 'Placez votre doigt sur le capteur ou regardez l\'écran'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur authentification biométrique:', error);
      
      let errorMessage = 'Authentification échouée';
      
      if (error.code) {
        switch (error.code) {
          case 'BiometryNotAvailable':
            errorMessage = 'Authentification biométrique non disponible';
            break;
          case 'BiometryNotEnrolled':
            errorMessage = 'Aucune empreinte enregistrée sur cet appareil';
            break;
          case 'UserCancel':
            errorMessage = 'Authentification annulée par l\'utilisateur';
            break;
          case 'UserFallback':
            errorMessage = 'L\'utilisateur a choisi le mot de passe';
            break;
          case 'SystemCancel':
            errorMessage = 'Authentification annulée par le système';
            break;
          case 'PasscodeNotSet':
            errorMessage = 'Aucun code d\'accès défini sur l\'appareil';
            break;
          case 'BiometryLockout':
            errorMessage = 'Trop de tentatives échouées';
            break;
          default:
            errorMessage = error.message || 'Erreur inconnue';
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async promptForBiometricSetup(): Promise<boolean> {
    const info = await this.getBiometricInfo();
    
    if (!info.isAvailable) {
      return false;
    }

    // Demander à l'utilisateur s'il veut activer la biométrie
    return new Promise((resolve) => {
      const message = info.biometryType === 'face' 
        ? 'Voulez-vous activer Face ID pour vos prochaines connexions ?'
        : 'Voulez-vous activer l\'empreinte digitale pour vos prochaines connexions ?';
      
      const result = confirm(message);
      resolve(result);
    });
  }

  // Méthodes utilitaires
  getBiometricTypeLabel(type?: string): string {
    switch (type) {
      case 'fingerprint':
        return 'Empreinte digitale';
      case 'face':
        return 'Face ID';
      case 'iris':
        return 'Reconnaissance iris';
      case 'voice':
        return 'Reconnaissance vocale';
      default:
        return 'Authentification biométrique';
    }
  }

  getBiometricIcon(type?: string): string {
    switch (type) {
      case 'fingerprint':
        return '👆';
      case 'face':
        return '👤';
      case 'iris':
        return '👁️';
      case 'voice':
        return '🎤';
      default:
        return '🔐';
    }
  }
}

export const biometricService = new BiometricService();