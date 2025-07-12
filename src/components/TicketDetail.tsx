import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Circle, 
  User, 
  Settings, 
  Star,
  RotateCcw,
  Send
} from 'lucide-react';

const TicketDetail: React.FC = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [reopenMessage, setReopenMessage] = useState('');
  const [showReopen, setShowReopen] = useState(false);

  // Mock ticket data
  const ticket = {
    id: 'T001',
    title: 'Problème de facturation - Montant incorrect',
    description: 'Ma dernière facture indique un montant de 45,000 XAF alors que ma consommation habituelle est de 25,000 XAF. Pourriez-vous vérifier ?',
    status: 'resolved',
    priority: 'high',
    created: new Date('2024-01-15'),
    resolved: new Date('2024-01-18'),
    agent: 'Marie Koukou',
    messages: [
      {
        id: '1',
        sender: 'user',
        content: 'Ma dernière facture indique un montant de 45,000 XAF alors que ma consommation habituelle est de 25,000 XAF.',
        timestamp: new Date('2024-01-15T10:30:00')
      },
      {
        id: '2',
        sender: 'agent',
        content: 'Bonjour, je vais vérifier votre dossier. Pouvez-vous me donner la période de facturation concernée ?',
        timestamp: new Date('2024-01-15T14:20:00')
      },
      {
        id: '3',
        sender: 'user',
        content: 'Il s\'agit de la période du 15 décembre au 15 janvier.',
        timestamp: new Date('2024-01-15T14:35:00')
      },
      {
        id: '4',
        sender: 'agent',
        content: 'Après vérification, il y avait effectivement une erreur dans le relevé. Votre facture a été corrigée à 24,750 XAF. Un avoir sera appliqué sur votre prochaine facture.',
        timestamp: new Date('2024-01-18T09:15:00')
      }
    ]
  };

  const timeline = [
    { status: 'Créé', date: ticket.created, active: true, icon: Circle },
    { status: 'Assigné', date: new Date('2024-01-15T15:00:00'), active: true, icon: User },
    { status: 'En cours', date: new Date('2024-01-16T09:00:00'), active: true, icon: Settings },
    { status: 'Résolu', date: ticket.resolved, active: true, icon: CheckCircle }
  ];

  const handleRating = (value: number) => {
    setRating(value);
    // Here you would typically send the rating to your backend
  };

  const handleReopen = () => {
    if (reopenMessage.trim()) {
      // Here you would send the reopen request to your backend
      alert('Ticket rouvert avec succès');
      setShowReopen(false);
      setReopenMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="mr-3 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Ticket #{ticket.id}</h1>
            <p className="text-blue-100 text-sm">{ticket.title}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Résolu
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Priorité Haute
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronologie</h3>
          
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.active ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <item.icon className={`w-4 h-4 ${
                    item.active ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${
                      item.active ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {item.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.date.toLocaleDateString('fr-FR')} à {item.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ticket.status === 'resolved' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Assigné à: <span className="font-medium">{ticket.agent}</span></p>
              <p className="text-sm text-gray-600">
                Résolu en {Math.ceil((ticket.resolved.getTime() - ticket.created.getTime()) / (1000 * 60 * 60 * 24))} jours
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
          
          <div className="space-y-4">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-md' 
                    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'
                } px-4 py-3`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.sender === 'user' ? 'Vous' : ticket.agent} • {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating (if resolved) */}
        {ticket.status === 'resolved' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comment évalueriez-vous la résolution de ce problème ?
            </h3>
            
            <div className="flex items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {rating > 0 && (
              <p className="text-sm text-green-600 font-medium">
                Merci pour votre évaluation ! ({rating}/5 étoiles)
              </p>
            )}
          </div>
        )}

        {/* Reopen Ticket */}
        {ticket.status === 'resolved' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            {!showReopen ? (
              <button
                onClick={() => setShowReopen(true)}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Rouvrir ce ticket
              </button>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rouvrir le ticket</h3>
                <textarea
                  value={reopenMessage}
                  onChange={(e) => setReopenMessage(e.target.value)}
                  placeholder="Décrivez pourquoi vous souhaitez rouvrir ce ticket..."
                  className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleReopen}
                    disabled={!reopenMessage.trim()}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Rouvrir
                  </button>
                  <button
                    onClick={() => {
                      setShowReopen(false);
                      setReopenMessage('');
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;