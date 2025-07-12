/**
 * Service de support client et gestion des tickets
 */

import { apiClient } from './api';
import { storageService } from './storage.service';

export interface Message {
  id: string;
  ticketId?: string;
  content: string;
  sender: 'user' | 'agent' | 'bot';
  senderName?: string;
  timestamp: Date;
  attachments?: Attachment[];
  isRead: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'billing' | 'technical' | 'connection' | 'complaint' | 'other';
  assignedAgent?: Agent;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  rating?: number;
  feedback?: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  isOnline: boolean;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
}

export interface BotResponse {
  message: string;
  suggestions?: string[];
  requiresHuman?: boolean;
  createTicket?: boolean;
}

class SupportService {
  private readonly TICKETS_CACHE_KEY = 'support_tickets';
  private readonly CHAT_CACHE_KEY = 'chat_session';
  private readonly AGENTS_CACHE_KEY = 'support_agents';

  // Gestion des tickets
  async getTickets(): Promise<Ticket[]> {
    try {
      // Vérifier le cache
      const cached = await storageService.getCachedData<Ticket[]>(this.TICKETS_CACHE_KEY);
      if (cached) {
        return cached;
      }

      // TODO: Vraie API
      // const response = await apiClient.get<Ticket[]>('/support/tickets');

      // Données simulées
      const tickets: Ticket[] = [
        {
          id: 'T001',
          title: 'Problème de facturation - Montant incorrect',
          description: 'Ma dernière facture indique un montant de 45,000 XAF alors que ma consommation habituelle est de 25,000 XAF. Pourriez-vous vérifier ?',
          status: 'resolved',
          priority: 'high',
          category: 'billing',
          assignedAgent: {
            id: 'agent_1',
            name: 'Marie Koukou',
            department: 'Facturation',
            isOnline: true
          },
          messages: [
            {
              id: 'msg_1',
              ticketId: 'T001',
              content: 'Ma dernière facture indique un montant de 45,000 XAF alors que ma consommation habituelle est de 25,000 XAF.',
              sender: 'user',
              timestamp: new Date('2024-01-15T10:30:00'),
              isRead: true
            },
            {
              id: 'msg_2',
              ticketId: 'T001',
              content: 'Bonjour, je vais vérifier votre dossier. Pouvez-vous me donner la période de facturation concernée ?',
              sender: 'agent',
              senderName: 'Marie Koukou',
              timestamp: new Date('2024-01-15T14:20:00'),
              isRead: true
            },
            {
              id: 'msg_3',
              ticketId: 'T001',
              content: 'Il s\'agit de la période du 15 décembre au 15 janvier.',
              sender: 'user',
              timestamp: new Date('2024-01-15T14:35:00'),
              isRead: true
            },
            {
              id: 'msg_4',
              ticketId: 'T001',
              content: 'Après vérification, il y avait effectivement une erreur dans le relevé. Votre facture a été corrigée à 24,750 XAF. Un avoir sera appliqué sur votre prochaine facture.',
              sender: 'agent',
              senderName: 'Marie Koukou',
              timestamp: new Date('2024-01-18T09:15:00'),
              isRead: true
            }
          ],
          createdAt: new Date('2024-01-15T10:30:00'),
          updatedAt: new Date('2024-01-18T09:15:00'),
          resolvedAt: new Date('2024-01-18T09:15:00'),
          rating: 5
        },
        {
          id: 'T002',
          title: 'Demande de raccordement nouveau compteur',
          description: 'Je souhaite faire installer un nouveau compteur pour ma nouvelle construction.',
          status: 'in-progress',
          priority: 'medium',
          category: 'connection',
          assignedAgent: {
            id: 'agent_2',
            name: 'Jean Mballa',
            department: 'Technique',
            isOnline: false
          },
          messages: [
            {
              id: 'msg_5',
              ticketId: 'T002',
              content: 'Je souhaite faire installer un nouveau compteur pour ma nouvelle construction à Douala.',
              sender: 'user',
              timestamp: new Date('2024-01-10T09:00:00'),
              isRead: true
            },
            {
              id: 'msg_6',
              ticketId: 'T002',
              content: 'Bonjour, pour traiter votre demande, j\'ai besoin de l\'adresse exacte et du plan de situation.',
              sender: 'agent',
              senderName: 'Jean Mballa',
              timestamp: new Date('2024-01-10T11:30:00'),
              isRead: true
            },
            {
              id: 'msg_7',
              ticketId: 'T002',
              content: 'Voici l\'adresse : Rue de la Paix, Akwa, Douala. Je peux vous envoyer le plan par email.',
              sender: 'user',
              timestamp: new Date('2024-01-10T14:00:00'),
              isRead: true
            }
          ],
          createdAt: new Date('2024-01-10T09:00:00'),
          updatedAt: new Date('2024-01-12T16:00:00')
        }
      ];

      // Cache pour 30 minutes
      await storageService.setCachedData(this.TICKETS_CACHE_KEY, tickets, 0.5);
      
      return tickets;
    } catch (error) {
      console.error('Erreur récupération tickets:', error);
      throw new Error('Impossible de récupérer les tickets');
    }
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    try {
      const tickets = await this.getTickets();
      return tickets.find(ticket => ticket.id === id) || null;
    } catch (error) {
      console.error('Erreur récupération ticket:', error);
      return null;
    }
  }

  async createTicket(data: {
    title: string;
    description: string;
    category: string;
    priority: string;
  }): Promise<Ticket> {
    try {
      // TODO: Vraie API
      // const response = await apiClient.post<Ticket>('/support/tickets', data);

      // Simulation
      const newTicket: Ticket = {
        id: 'T' + Date.now().toString().slice(-3),
        title: data.title,
        description: data.description,
        status: 'open',
        priority: data.priority as any,
        category: data.category as any,
        messages: [
          {
            id: 'msg_' + Date.now(),
            content: data.description,
            sender: 'user',
            timestamp: new Date(),
            isRead: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Invalider le cache
      await storageService.setCachedData(this.TICKETS_CACHE_KEY, null, 0);
      
      return newTicket;
    } catch (error) {
      console.error('Erreur création ticket:', error);
      throw new Error('Impossible de créer le ticket');
    }
  }

  async addMessageToTicket(ticketId: string, content: string, attachments?: File[]): Promise<Message> {
    try {
      // TODO: Upload des fichiers et vraie API
      // const response = await apiClient.post(`/support/tickets/${ticketId}/messages`, {
      //   content,
      //   attachments
      // });

      const newMessage: Message = {
        id: 'msg_' + Date.now(),
        ticketId,
        content,
        sender: 'user',
        timestamp: new Date(),
        isRead: true
      };

      // Invalider le cache des tickets
      await storageService.setCachedData(this.TICKETS_CACHE_KEY, null, 0);
      
      return newMessage;
    } catch (error) {
      console.error('Erreur ajout message:', error);
      throw new Error('Impossible d\'ajouter le message');
    }
  }

  async reopenTicket(ticketId: string, reason: string): Promise<void> {
    try {
      // TODO: Vraie API
      // await apiClient.post(`/support/tickets/${ticketId}/reopen`, { reason });

      // Invalider le cache
      await storageService.setCachedData(this.TICKETS_CACHE_KEY, null, 0);
    } catch (error) {
      console.error('Erreur réouverture ticket:', error);
      throw new Error('Impossible de rouvrir le ticket');
    }
  }

  async rateTicket(ticketId: string, rating: number, feedback?: string): Promise<void> {
    try {
      // TODO: Vraie API
      // await apiClient.post(`/support/tickets/${ticketId}/rate`, { rating, feedback });

      // Invalider le cache
      await storageService.setCachedData(this.TICKETS_CACHE_KEY, null, 0);
    } catch (error) {
      console.error('Erreur évaluation ticket:', error);
      throw new Error('Impossible d\'évaluer le ticket');
    }
  }

  // Gestion du chat bot
  async sendChatMessage(message: string): Promise<BotResponse> {
    try {
      // TODO: Vraie API avec IA
      // const response = await apiClient.post<BotResponse>('/support/chat', { message });

      // Simulation de réponses intelligentes
      const botResponse = this.generateBotResponse(message);
      
      // Sauvegarder dans la session de chat
      await this.saveChatMessage({
        id: 'msg_' + Date.now(),
        content: message,
        sender: 'user',
        timestamp: new Date(),
        isRead: true
      });

      await this.saveChatMessage({
        id: 'msg_' + (Date.now() + 1),
        content: botResponse.message,
        sender: 'bot',
        timestamp: new Date(),
        isRead: true
      });

      return botResponse;
    } catch (error) {
      console.error('Erreur chat bot:', error);
      throw new Error('Impossible de traiter votre message');
    }
  }

  private generateBotResponse(userMessage: string): BotResponse {
    const message = userMessage.toLowerCase();
    
    if (message.includes('facture') || message.includes('payer') || message.includes('montant')) {
      return {
        message: 'Je peux vous aider avec votre facture. Votre dernière facture est de 25,430 XAF. Souhaitez-vous procéder au paiement ou avez-vous une question spécifique ?',
        suggestions: ['Payer ma facture', 'Contester le montant', 'Télécharger la facture']
      };
    }
    
    if (message.includes('panne') || message.includes('coupure') || message.includes('électricité')) {
      return {
        message: 'Je vois que vous rencontrez un problème d\'alimentation. Puis-je avoir votre adresse exacte pour vérifier s\'il y a des incidents signalés dans votre zone ?',
        suggestions: ['Voir la carte des pannes', 'Signaler une panne', 'Parler à un agent']
      };
    }
    
    if (message.includes('compteur') || message.includes('installation') || message.includes('raccordement')) {
      return {
        message: 'Pour les questions relatives au compteur, je peux vous aider avec la lecture, le remplacement ou la maintenance. Quel est votre besoin spécifique ?',
        suggestions: ['Nouveau raccordement', 'Problème de compteur', 'Relevé de compteur'],
        requiresHuman: true
      };
    }
    
    if (message.includes('urgent') || message.includes('problème grave')) {
      return {
        message: 'Je comprends que votre situation est urgente. Je vais vous mettre en relation avec un agent disponible immédiatement.',
        requiresHuman: true,
        createTicket: true
      };
    }
    
    return {
      message: 'Merci pour votre message. Un de nos agents va examiner votre demande et vous répondre sous peu. Voulez-vous que je crée un ticket de support pour un suivi personnalisé ?',
      suggestions: ['Créer un ticket', 'Parler à un agent', 'Voir mes tickets'],
      createTicket: true
    };
  }

  async getChatSession(): Promise<ChatSession | null> {
    return await storageService.getCachedData<ChatSession>(this.CHAT_CACHE_KEY);
  }

  async startChatSession(): Promise<ChatSession> {
    const session: ChatSession = {
      id: 'chat_' + Date.now(),
      messages: [
        {
          id: 'welcome_msg',
          content: 'Bonjour ! Je suis votre assistant virtuel Eneo. Comment puis-je vous aider aujourd\'hui ?',
          sender: 'bot',
          timestamp: new Date(),
          isRead: true
        }
      ],
      isActive: true,
      startedAt: new Date()
    };

    await storageService.setCachedData(this.CHAT_CACHE_KEY, session, 24); // 24h
    return session;
  }

  private async saveChatMessage(message: Message): Promise<void> {
    const session = await this.getChatSession();
    if (session) {
      session.messages.push(message);
      session.isActive = true;
      await storageService.setCachedData(this.CHAT_CACHE_KEY, session, 24);
    }
  }

  async endChatSession(): Promise<void> {
    const session = await this.getChatSession();
    if (session) {
      session.isActive = false;
      session.endedAt = new Date();
      await storageService.setCachedData(this.CHAT_CACHE_KEY, session, 24);
    }
  }

  // Méthodes utilitaires
  getTicketStatusLabel(status: string): string {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'assigned':
        return 'Assigné';
      case 'in-progress':
        return 'En cours';
      case 'resolved':
        return 'Résolu';
      case 'closed':
        return 'Fermé';
      default:
        return status;
    }
  }

  getTicketStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-100';
      case 'assigned':
        return 'text-orange-600 bg-orange-100';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getTicketPriorityLabel(priority: string): string {
    switch (priority) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Haute';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  }

  getTicketPriorityColor(priority: string): string {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'urgent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'billing':
        return 'Facturation';
      case 'technical':
        return 'Technique';
      case 'connection':
        return 'Raccordement';
      case 'complaint':
        return 'Réclamation';
      case 'other':
        return 'Autre';
      default:
        return category;
    }
  }

  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return timestamp.toLocaleDateString('fr-FR');
  }
}

export const supportService = new SupportService();