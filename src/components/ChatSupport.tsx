import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Clock, CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'assigned' | 'in-progress' | 'resolved';
  created: Date;
  lastUpdate: Date;
  priority: 'low' | 'medium' | 'high';
  messages: number;
}

const ChatSupport: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant virtuel Eneo. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tickets: Ticket[] = [
    {
      id: 'T001',
      title: 'Problème de facturation - Montant incorrect',
      status: 'in-progress',
      created: new Date('2024-01-15'),
      lastUpdate: new Date('2024-01-16'),
      priority: 'high',
      messages: 5
    },
    {
      id: 'T002',
      title: 'Demande de raccordement nouveau compteur',
      status: 'assigned',
      created: new Date('2024-01-10'),
      lastUpdate: new Date('2024-01-12'),
      priority: 'medium',
      messages: 3
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('facture') || input.includes('payer')) {
      return 'Je peux vous aider avec votre facture. Votre dernière facture est de 25,430 XAF. Souhaitez-vous procéder au paiement ou avez-vous une question spécifique ?';
    } else if (input.includes('panne') || input.includes('coupure')) {
      return 'Je vois que vous rencontrez un problème d\'alimentation. Puis-je avoir votre adresse exacte pour vérifier s\'il y a des incidents signalés dans votre zone ?';
    } else if (input.includes('compteur')) {
      return 'Pour les questions relatives au compteur, je peux vous aider avec la lecture, le remplacement ou la maintenance. Quel est votre besoin spécifique ?';
    } else {
      return 'Merci pour votre message. Un de nos agents va examiner votre demande et vous répondre sous peu. Voulez-vous que je crée un ticket de support pour un suivi personnalisé ?';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'assigned':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'assigned': return 'Assigné';
      case 'in-progress': return 'En cours';
      case 'resolved': return 'Résolu';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showTickets) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowTickets(false)}
              className="mr-3 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              ←
            </button>
            <h1 className="text-xl font-bold">Mes Tickets</h1>
          </div>
        </div>

        {/* Tickets List */}
        <div className="px-4 py-6 space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 cursor-pointer"
              onClick={() => window.location.href = `/ticket/${ticket.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{ticket.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">#{ticket.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(ticket.status)}
                  <span className="text-sm text-gray-600">{getStatusText(ticket.status)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {ticket.messages} messages
                </div>
              </div>

              {/* Simple timeline */}
              <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-4 h-0.5 bg-gray-300"></div>
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.status === 'assigned' || ticket.status === 'in-progress' || ticket.status === 'resolved' 
                      ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="w-4 h-0.5 bg-gray-300"></div>
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.status === 'in-progress' || ticket.status === 'resolved' 
                      ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="w-4 h-0.5 bg-gray-300"></div>
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Créé le {ticket.created.toLocaleDateString('fr-FR')} • 
                Mis à jour le {ticket.lastUpdate.toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Assistant Eneo</h1>
              <p className="text-blue-100 text-sm">En ligne • Répond instantanément</p>
            </div>
          </div>
          <button
            onClick={() => setShowTickets(true)}
            className="bg-white/20 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Mes Tickets
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-end space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-md' 
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;