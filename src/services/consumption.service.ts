/**
 * Service de gestion de la consommation électrique
 */

import { apiClient } from './api';
import { storageService } from './storage.service';

export interface ConsumptionData {
  current: number;
  limit: number;
  unit: 'kWh' | 'XAF';
  period: string;
  lastUpdate: Date;
}

export interface ConsumptionHistory {
  date: string;
  consumption: number;
  cost: number;
}

export interface ConsumptionComparison {
  value: number;
  trend: 'up' | 'down';
  period: string;
}

export interface BillData {
  id: string;
  amount: number;
  currency: string;
  dueDate: Date;
  issueDate: Date;
  status: 'unpaid' | 'paid' | 'overdue';
  period: string;
  downloadUrl?: string;
}

class ConsumptionService {
  private readonly CACHE_KEY = 'consumption_data';
  private readonly BILLS_CACHE_KEY = 'bills_data';

  async getCurrentConsumption(): Promise<ConsumptionData> {
    try {
      // Vérifier le cache d'abord
      const cached = await storageService.getCachedData<ConsumptionData>(this.CACHE_KEY);
      if (cached) {
        return cached;
      }

      // TODO: Vraie API
      // const response = await apiClient.get<ConsumptionData>('/consumption/current');
      // const data = response.data;

      // Données simulées
      const data: ConsumptionData = {
        current: 245,
        limit: 300,
        unit: 'kWh',
        period: 'Janvier 2024',
        lastUpdate: new Date()
      };

      // Mettre en cache pour 1 heure
      await storageService.setCachedData(this.CACHE_KEY, data, 1);
      
      return data;
    } catch (error) {
      console.error('Erreur récupération consommation:', error);
      throw new Error('Impossible de récupérer les données de consommation');
    }
  }

  async getConsumptionHistory(months: number = 12): Promise<ConsumptionHistory[]> {
    try {
      // TODO: Vraie API
      // const response = await apiClient.get<ConsumptionHistory[]>(`/consumption/history?months=${months}`);
      // return response.data;

      // Données simulées
      const history: ConsumptionHistory[] = [];
      const now = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const baseConsumption = 200 + Math.random() * 100;
        
        history.push({
          date: date.toISOString().slice(0, 7), // YYYY-MM
          consumption: Math.round(baseConsumption),
          cost: Math.round(baseConsumption * 150) // 150 XAF par kWh
        });
      }
      
      return history;
    } catch (error) {
      console.error('Erreur historique consommation:', error);
      throw new Error('Impossible de récupérer l\'historique');
    }
  }

  async getConsumptionComparison(): Promise<ConsumptionComparison> {
    try {
      const history = await this.getConsumptionHistory(2);
      
      if (history.length < 2) {
        return {
          value: 0,
          trend: 'down',
          period: 'mois dernier'
        };
      }

      const current = history[history.length - 1];
      const previous = history[history.length - 2];
      
      const difference = current.consumption - previous.consumption;
      const percentage = Math.abs(Math.round((difference / previous.consumption) * 100));
      
      return {
        value: percentage,
        trend: difference > 0 ? 'up' : 'down',
        period: 'mois dernier'
      };
    } catch (error) {
      console.error('Erreur comparaison consommation:', error);
      return {
        value: 0,
        trend: 'down',
        period: 'mois dernier'
      };
    }
  }

  async convertUnit(value: number, fromUnit: 'kWh' | 'XAF', toUnit: 'kWh' | 'XAF'): Promise<number> {
    if (fromUnit === toUnit) return value;
    
    // Taux de conversion (à récupérer depuis l'API en production)
    const RATE_PER_KWH = 150; // 150 XAF par kWh
    
    if (fromUnit === 'kWh' && toUnit === 'XAF') {
      return Math.round(value * RATE_PER_KWH);
    } else if (fromUnit === 'XAF' && toUnit === 'kWh') {
      return Math.round(value / RATE_PER_KWH);
    }
    
    return value;
  }

  async getCurrentBill(): Promise<BillData> {
    try {
      // Vérifier le cache
      const cached = await storageService.getCachedData<BillData>(this.BILLS_CACHE_KEY);
      if (cached) {
        return cached;
      }

      // TODO: Vraie API
      // const response = await apiClient.get<BillData>('/bills/current');
      // const bill = response.data;

      // Données simulées
      const bill: BillData = {
        id: 'BILL_2024_01_001',
        amount: 25430,
        currency: 'XAF',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        status: 'unpaid',
        period: 'Décembre 2023 - Janvier 2024',
        downloadUrl: '/api/bills/BILL_2024_01_001/download'
      };

      // Cache pour 6 heures
      await storageService.setCachedData(this.BILLS_CACHE_KEY, bill, 6);
      
      return bill;
    } catch (error) {
      console.error('Erreur récupération facture:', error);
      throw new Error('Impossible de récupérer la facture actuelle');
    }
  }

  async payBill(billId: string, paymentMethod: string): Promise<{ success: boolean; transactionId?: string }> {
    try {
      // TODO: Vraie API de paiement
      // const response = await apiClient.post('/bills/pay', {
      //   billId,
      //   paymentMethod
      // });

      // Simulation de paiement
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const transactionId = 'TXN_' + Date.now();
      
      // Invalider le cache de la facture
      await storageService.setCachedData(this.BILLS_CACHE_KEY, null, 0);
      
      return {
        success: true,
        transactionId
      };
    } catch (error) {
      console.error('Erreur paiement facture:', error);
      throw new Error('Échec du paiement');
    }
  }

  async downloadBill(billId: string): Promise<string> {
    try {
      // TODO: Vraie API
      // const response = await apiClient.get(`/bills/${billId}/download`);
      // return response.data.downloadUrl;

      // Simulation
      return `https://api.eneo.cm/bills/${billId}/download?token=mock_token`;
    } catch (error) {
      console.error('Erreur téléchargement facture:', error);
      throw new Error('Impossible de télécharger la facture');
    }
  }

  // Méthodes utilitaires
  formatConsumption(value: number, unit: 'kWh' | 'XAF'): string {
    if (unit === 'XAF') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
      }).format(value);
    } else {
      return `${value} kWh`;
    }
  }

  formatAmount(amount: number, currency: string = 'XAF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  getBillStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'unpaid':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  }

  getBillStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'unpaid':
        return 'text-orange-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}

export const consumptionService = new ConsumptionService();