import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Send, 
  Bot, 
  User, 
  Users, 
  MessageCircle, 
  Plus, 
  Hash, 
  MapPin,
  Calendar,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ChatProps {
  onNavigate: (page: string) => void;
}

interface Message {
  id: string;
  message: string;
  userId: string;
  userName: string;
  timestamp: string;
  roomId: string;
}

export function Chat({ onNavigate }: ChatProps) {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const chatRooms = [
    { id: 'general', name: 'General Travel', icon: <MessageCircle className="h-4 w-4" />, members: 24 },
    { id: 'europe', name: 'Europe Adventures', icon: <MapPin className="h-4 w-4" />, members: 18 },
    { id: 'budget', name: 'Budget Travel Tips', icon: <DollarSign className="h-4 w-4" />, members: 31 },
    { id: 'planning', name: 'Trip Planning', icon: <Calendar className="h-4 w-4" />, members: 15 }
  ];

  // AI Assistant mock responses
  const aiResponses = [
    "I'd be happy to help you plan your trip! What destination are you considering?",
    "Based on your preferences, I recommend checking out our personalized itinerary feature. It can create a perfect schedule for your trip!",
    "For budget travel, consider visiting during off-peak seasons and booking accommodations in advance. Would you like specific recommendations?",
    "European travel is amazing! The best time to visit depends on your preferences. Spring and fall offer great weather and fewer crowds.",
    "I can help you find the best deals on hotels and flights. What's your travel budget and preferred dates?",
    "Travel insurance is always a good idea, especially for international trips. I can suggest some reliable providers."
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a04762c/chat/messages/${currentRoom}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!user) {
      setError('Please login to send messages');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const accessToken = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a04762c/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            message: newMessage,
            roomId: currentRoom
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');

        // Simulate AI response in AI assistant rooms
        if (currentRoom === 'ai-assistant') {
          setTimeout(() => {
            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
            const aiMessage = {
              id: `ai-${Date.now()}`,
              message: randomResponse,
              userId: 'ai-assistant',
              userName: 'AI Travel Assistant',
              timestamp: new Date().toISOString(),
              roomId: currentRoom
            };
            setMessages(prev => [...prev, aiMessage]);
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwnMessage = user && message.userId === user.id;
    const isAI = message.userId === 'ai-assistant';
    
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          <div className={`flex items-center mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'} space-x-2`}>
            {!isOwnMessage && (
              <div className="flex items-center space-x-1">
                {isAI ? (
                  <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#36bcf8' }}>
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="text-xs font-medium text-gray-600">{message.userName}</span>
              </div>
            )}
            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          </div>
          <div
            className={`rounded-lg p-3 ${
              isOwnMessage
                ? 'text-white'
                : isAI
                ? 'bg-blue-50 text-gray-900 border border-blue-200'
                : 'bg-gray-100 text-gray-900'
            }`}
            style={isOwnMessage ? { backgroundColor: '#36bcf8' } : {}}
          >
            <p className="text-sm">{message.message}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Travel Chat & AI Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Connect with fellow travelers and get instant help from our AI assistant
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Chat Rooms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* AI Assistant */}
                <button
                  onClick={() => setCurrentRoom('ai-assistant')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentRoom === 'ai-assistant'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: currentRoom === 'ai-assistant' ? '#36bcf8' : 'transparent'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: currentRoom === 'ai-assistant' ? 'rgba(255,255,255,0.2)' : '#e0f7ff',
                        color: currentRoom === 'ai-assistant' ? 'white' : '#36bcf8'
                      }}
                    >
                      AI
                    </Badge>
                  </div>
                </button>

                {/* Regular Chat Rooms */}
                {chatRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setCurrentRoom(room.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentRoom === room.id
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: currentRoom === room.id ? '#36bcf8' : 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {room.icon}
                        <span className="font-medium">{room.name}</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: currentRoom === room.id ? 'rgba(255,255,255,0.2)' : '#e0f7ff',
                          color: currentRoom === room.id ? 'white' : '#36bcf8'
                        }}
                      >
                        {room.members}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('itinerary')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Itinerary
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('booking')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Hotels
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Budget Calculator
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Hash className="h-5 w-5" />
                    <span>
                      {currentRoom === 'ai-assistant' 
                        ? 'AI Travel Assistant' 
                        : chatRooms.find(room => room.id === currentRoom)?.name || 'Chat'
                      }
                    </span>
                  </CardTitle>
                  {currentRoom === 'ai-assistant' && (
                    <Badge className="text-white" style={{ backgroundColor: '#36bcf8' }}>
                      <Bot className="h-3 w-3 mr-1" />
                      AI Powered
                    </Badge>
                  )}
                </div>
                {currentRoom === 'ai-assistant' && (
                  <p className="text-sm text-gray-600">
                    Get instant help with trip planning, recommendations, and travel advice
                  </p>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {currentRoom === 'ai-assistant' && messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#36bcf8' }}>
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome to AI Travel Assistant!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      I'm here to help you plan the perfect trip. Ask me about destinations, budgets, itineraries, or anything travel-related!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewMessage("What are the best destinations for a romantic getaway?")}
                      >
                        Romantic destinations?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewMessage("Help me plan a budget trip to Europe")}
                      >
                        Budget Europe trip?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewMessage("What should I pack for a beach vacation?")}
                      >
                        Beach packing list?
                      </Button>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Please login to join the conversation</p>
                    <Button 
                      onClick={() => onNavigate('login')}
                      className="text-white"
                      style={{ backgroundColor: '#36bcf8' }}
                    >
                      Login to Chat
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        currentRoom === 'ai-assistant' 
                          ? "Ask me anything about travel..." 
                          : "Type your message..."
                      }
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !newMessage.trim()}
                      className="text-white"
                      style={{ backgroundColor: '#36bcf8' }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}