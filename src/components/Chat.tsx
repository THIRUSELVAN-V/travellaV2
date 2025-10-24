import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Sparkles, 
  MessageCircle,
  MapPin,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);


  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const result = await window.storage.get('ai-chat-history');
      if (result) {
        setMessages(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No chat history found');
    }
  };

  const saveChatHistory = async (updatedMessages) => {
    try {
      await window.storage.set('ai-chat-history', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

 const sendMessageToGemini = async (userMessage) => {
  try {
    const response = await fetch("http://localhost:5000/api/chat/aichat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) throw new Error("Backend error");
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error calling backend:", error);
    throw error;
  }
};


  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    setError('');

    const userMessage = {
      id: `user-${Date.now()}`,
      message: newMessage,
      sender: 'user',
      userName: 'You',
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const aiResponse = await sendMessageToGemini(messageToSend);

      const aiMessage = {
        id: `ai-${Date.now()}`,
        message: aiResponse,
        sender: 'ai',
        userName: 'AI Assistant',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } catch (error) {
      setError('Failed to get response. Please check your API key and try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const chatRooms = [
    { name: 'General Travel', icon: <MessageCircle className="h-4 w-4" />, count: 24 },
    { name: 'Europe Adventures', icon: <MapPin className="h-4 w-4" />, count: 18 },
    { name: 'Budget Travel Tips', icon: <DollarSign className="h-4 w-4" />, count: 31 },
    { name: 'Trip Planning', icon: <Calendar className="h-4 w-4" />, count: 15 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 h-full lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 h-200 space-y-6">
            <Card className="bg-white h-600 border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-gray-700">
                  <MessageCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Chat Rooms</h3>
                </div>
              </div>
              <div className="p-3">
                <button className="w-full text-left mb-2 p-3 rounded-lg bg-cyan-400 text-white hover:bg-cyan-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium text-sm">AI Assistant</span>
                    </div>
                    <Badge className="bg-white/20 text-white text-xs border-0">
                      AI
                    </Badge>
                  </div>
                </button>
                {chatRooms.map((room, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left mb-2 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {room.icon}
                        <span className="font-medium text-sm">{room.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-600 text-xs border-0">
                        {room.count}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 h-300">
            <Card className="bg-white border border-gray-200">
              {/* Chat Header */}
              <div className="p-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">#</span>
                      <h2 className="text-lg font-semibold text-gray-900">AI Travel Assistant</h2>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Get instant help with trip planning, recommendations, and travel advice
                    </p>
                  </div>
                  <Badge className="bg-cyan-400 text-white border-0">
                    AI Powered
                  </Badge>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-[500px] overflow-y-auto p-6">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-block p-4 rounded-full bg-cyan-100 mb-4">
                      <Sparkles className="h-8  w-8 text-cyan-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Welcome to AI Travel Assistant!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Ask me about destinations, budgets, itineraries, or anything travel-related!
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className="mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {message.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 text-gray-800 text-sm">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 mb-1">AI Assistant</div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about travel..."
                    className="flex-1 border-gray-300"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    className="bg-cyan-400 hover:bg-cyan-500 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}