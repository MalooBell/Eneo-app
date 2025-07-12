/**
 * Service de gestion des notifications push
 * Utilise Capacitor Push Notifications pour mobile
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
  badge?: number;
  sound?: string;
  icon?: string;
  image?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  billing: boolean;
  outages: boolean;
  promotions: boolean;
  maintenance: boolean;
  tickets: boolean;
}

export interface PushNotificationToken {
  token: string;
  platform: 'web' | 'ios' | 'android';
  createdAt: Date;
}

class NotificationsService {
  private isCapacitor = false;
  private pushNotifications: any = null;
  private localNotifications: any = null;

  constructor() {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        this.isCapacitor = true;
        
        // Import dynamique des plugins Capacitor
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        this.pushNotifications = PushNotifications;
        this.localNotifications = LocalNotifications;
        
        await this.setupPushNotifications();
      } else {
        // Fallback pour le web avec Service Worker
        await this.setupWebNotifications();
      }
    } catch (error) {
      console.log('Notifications non disponibles:', error);
    }
  }

  private async setupPushNotifications() {
    if (!this.pushNotifications) return;

    try {
      // Demander la permission
      const permission = await this.pushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Enregistrer pour les notifications push
        await this.pushNotifications.register();
        
        // Écouter les événements
        this.pushNotifications.addListener('registration', (token: any) => {
          console.log('Push registration success, token: ' + token.value);
          this.savePushToken(token.value);
        });

        this.pushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        this.pushNotifications.addListener('pushNotificationReceived', (notification: any) => {
          console.log('Push received: ' + JSON.stringify(notification));
          this.handleNotificationReceived(notification);
        });

        this.pushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
          this.handleNotificationAction(notification);
        });
      }
    } catch (error) {
      console.error('Erreur setup push notifications:', error);
    }
  }

  private async setupWebNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker enregistré:', registration);

        // Demander la permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Permission notifications accordée');
        }
      } catch (error) {
        console.error('Erreur setup web notifications:', error);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (this.isCapacitor && this.pushNotifications) {
      try {
        const permission = await this.pushNotifications.requestPermissions();
        return permission.receive === 'granted';
      } catch (error) {
        console.error('Erreur demande permission:', error);
        return false;
      }
    } else {
      // Web notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }
  }

  async isPermissionGranted(): Promise<boolean> {
    if (this.isCapacitor && this.pushNotifications) {
      try {
        const permission = await this.pushNotifications.checkPermissions();
        return permission.receive === 'granted';
      } catch (error) {
        return false;
      }
    } else {
      return Notification.permission === 'granted';
    }
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (this.isCapacitor && this.localNotifications) {
      try {
        await this.localNotifications.schedule({
          notifications: [
            {
              title: payload.title,
              body: payload.body,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) }, // Dans 1 seconde
              sound: payload.sound || 'default',
              attachments: payload.image ? [{ id: 'image', url: payload.image }] : undefined,
              actionTypeId: payload.actions ? 'ENEO_ACTIONS' : undefined,
              extra: payload.data
            }
          ]
        });
      } catch (error) {
        console.error('Erreur notification locale:', error);
      }
    } else {
      // Web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          image: payload.image,
          badge: '/badge-72x72.png',
          data: payload.data,
          actions: payload.actions?.map(action => ({
            action: action.id,
            title: action.title,
            icon: action.icon
          }))
        });
      }
    }
  }

  async scheduleNotification(payload: NotificationPayload, scheduleAt: Date): Promise<void> {
    if (this.isCapacitor && this.localNotifications) {
      try {
        await this.localNotifications.schedule({
          notifications: [
            {
              title: payload.title,
              body: payload.body,
              id: Date.now(),
              schedule: { at: scheduleAt },
              sound: payload.sound || 'default',
              extra: payload.data
            }
          ]
        });
      } catch (error) {
        console.error('Erreur programmation notification:', error);
      }
    }
  }

  async cancelNotification(id: number): Promise<void> {
    if (this.isCapacitor && this.localNotifications) {
      try {
        await this.localNotifications.cancel({
          notifications: [{ id }]
        });
      } catch (error) {
        console.error('Erreur annulation notification:', error);
      }
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (this.isCapacitor && this.localNotifications) {
      try {
        const pending = await this.localNotifications.getPending();
        if (pending.notifications.length > 0) {
          await this.localNotifications.cancel({
            notifications: pending.notifications
          });
        }
      } catch (error) {
        console.error('Erreur annulation toutes notifications:', error);
      }
    }
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      const tokenData: PushNotificationToken = {
        token,
        platform: this.isCapacitor ? 
          ((window as any).Capacitor?.getPlatform() || 'unknown') : 'web',
        createdAt: new Date()
      };

      // Sauvegarder localement
      localStorage.setItem('eneo_push_token', JSON.stringify(tokenData));

      // TODO: Envoyer au backend
      // await apiClient.post('/notifications/register-token', tokenData);
    } catch (error) {
      console.error('Erreur sauvegarde token:', error);
    }
  }

  private handleNotificationReceived(notification: any): void {
    console.log('Notification reçue:', notification);
    
    // Traitement personnalisé selon le type
    if (notification.data?.type) {
      switch (notification.data.type) {
        case 'billing':
          this.handleBillingNotification(notification);
          break;
        case 'outage':
          this.handleOutageNotification(notification);
          break;
        case 'ticket':
          this.handleTicketNotification(notification);
          break;
        default:
          console.log('Type de notification non géré:', notification.data.type);
      }
    }
  }

  private handleNotificationAction(notification: any): void {
    console.log('Action notification:', notification);
    
    const action = notification.actionId;
    const data = notification.notification.data;
    
    switch (action) {
      case 'pay_bill':
        // Rediriger vers le paiement
        window.location.href = '/dashboard';
        break;
      case 'view_incident':
        // Rediriger vers la carte
        window.location.href = '/incidents';
        break;
      case 'view_ticket':
        // Rediriger vers le ticket
        window.location.href = `/ticket/${data.ticketId}`;
        break;
      default:
        // Action par défaut : ouvrir l'app
        window.location.href = '/dashboard';
    }
  }

  private handleBillingNotification(notification: any): void {
    // Logique spécifique aux notifications de facturation
    console.log('Notification facturation:', notification);
  }

  private handleOutageNotification(notification: any): void {
    // Logique spécifique aux notifications de panne
    console.log('Notification panne:', notification);
  }

  private handleTicketNotification(notification: any): void {
    // Logique spécifique aux notifications de ticket
    console.log('Notification ticket:', notification);
  }

  // Notifications prédéfinies pour Eneo
  async notifyBillReady(amount: number, dueDate: Date): Promise<void> {
    await this.sendLocalNotification({
      title: 'Nouvelle facture Eneo',
      body: `Votre facture de ${amount.toLocaleString()} XAF est disponible`,
      data: { type: 'billing', amount, dueDate },
      actions: [
        { id: 'pay_bill', title: 'Payer maintenant' },
        { id: 'view_bill', title: 'Voir la facture' }
      ]
    });
  }

  async notifyBillDue(amount: number, daysLeft: number): Promise<void> {
    await this.sendLocalNotification({
      title: 'Rappel de paiement',
      body: `Votre facture de ${amount.toLocaleString()} XAF expire dans ${daysLeft} jour(s)`,
      data: { type: 'billing', amount, daysLeft },
      actions: [
        { id: 'pay_bill', title: 'Payer maintenant' }
      ]
    });
  }

  async notifyOutage(location: string, estimatedDuration: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'Panne électrique signalée',
      body: `Coupure en cours à ${location}. Durée estimée: ${estimatedDuration}`,
      data: { type: 'outage', location, estimatedDuration },
      actions: [
        { id: 'view_incident', title: 'Voir sur la carte' }
      ]
    });
  }

  async notifyOutageResolved(location: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'Panne résolue',
      body: `L'alimentation électrique a été rétablie à ${location}`,
      data: { type: 'outage_resolved', location }
    });
  }

  async notifyMaintenanceScheduled(location: string, scheduledDate: Date): Promise<void> {
    await this.sendLocalNotification({
      title: 'Maintenance programmée',
      body: `Travaux prévus à ${location} le ${scheduledDate.toLocaleDateString('fr-FR')}`,
      data: { type: 'maintenance', location, scheduledDate }
    });
  }

  async notifyTicketUpdate(ticketId: string, status: string, message: string): Promise<void> {
    await this.sendLocalNotification({
      title: `Ticket ${ticketId} - ${status}`,
      body: message,
      data: { type: 'ticket', ticketId, status },
      actions: [
        { id: 'view_ticket', title: 'Voir le ticket' }
      ]
    });
  }

  // Gestion des préférences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const prefs = localStorage.getItem('eneo_notification_prefs');
    return prefs ? JSON.parse(prefs) : {
      billing: true,
      outages: true,
      promotions: false,
      maintenance: true,
      tickets: true
    };
  }

  async setNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    localStorage.setItem('eneo_notification_prefs', JSON.stringify(preferences));
    
    // TODO: Synchroniser avec le backend
    // await apiClient.post('/notifications/preferences', preferences);
  }

  async updateNotificationPreference(type: keyof NotificationPreferences, enabled: boolean): Promise<void> {
    const prefs = await this.getNotificationPreferences();
    prefs[type] = enabled;
    await this.setNotificationPreferences(prefs);
  }
}

export const notificationsService = new NotificationsService();