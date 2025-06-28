"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MinusCircle, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  helpful?: boolean;
}

interface SupportBotProps {
  className?: string;
  inline?: boolean;
}

const quickActions = [
  'How do I create a project?',
  'What are the fees?',
  'How does milestone verification work?',
  'How to connect my wallet?',
  'What is DAO governance?',
  'Tax implications of donations'
];

const supportCategories = [
  { 
    title: 'Getting Started',
    questions: [
      'How to create an account?',
      'How to connect wallet?',
      'Platform overview'
    ]
  },
  {
    title: 'Projects',
    questions: [
      'Creating NGO projects',
      'Startup funding process',
      'Project verification'
    ]
  },
  {
    title: 'Donations & Investment',
    questions: [
      'How to donate?',
      'Investment process',
      'Tax benefits'
    ]
  },
  {
    title: 'Technical Support',
    questions: [
      'Wallet connection issues',
      'Transaction problems',
      'Platform bugs'
    ]
  }
];

export function SupportBot({ className = "", inline = false }: SupportBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant for ImpactChain & CharityChain. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: quickActions.slice(0, 3)
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('create') && lowerMessage.includes('project')) {
      return 'To create a project:\n\n1. Click "Create Project" in the navigation\n2. Choose between NGO or Startup\n3. Fill out the detailed form\n4. Submit for verification\n\nThe verification process typically takes 2-3 business days. Would you like specific guidance for NGO or startup projects?';
    }
    
    if (lowerMessage.includes('fees') || lowerMessage.includes('cost')) {
      return 'Our platform fees are:\n\n• NGO Projects: 2.5% platform fee\n• Startup Funding: 3% platform fee\n• Gas fees for blockchain transactions\n\nFees are only charged on successful funding. There are no upfront costs to create a project.';
    }
    
    if (lowerMessage.includes('milestone')) {
      return 'Milestone verification works as follows:\n\n1. Project creators set milestones during setup\n2. Funds are released when milestones are achieved\n3. Verification is done through:\n   - AI analysis of submitted evidence\n   - Multi-signature wallet approval\n   - Community review for transparency\n\nThis ensures donors that funds are used as intended.';
    }
    
    if (lowerMessage.includes('wallet')) {
      return 'To connect your wallet:\n\n1. Click "Connect Wallet" in the top right\n2. Choose from MetaMask, WalletConnect, or Coinbase Wallet\n3. Approve the connection request\n4. Sign the authentication message\n\nFor non-crypto users, you can also sign up with email and we\'ll create a smart wallet for you.';
    }
    
    if (lowerMessage.includes('dao') || lowerMessage.includes('governance')) {
      return 'DAO Governance allows community decision-making:\n\n• Vote on platform upgrades\n• Approve fee changes\n• Resolve milestone disputes\n• Set community guidelines\n\nYour voting power is based on your platform participation and stake. All proposals are transparent and recorded on-chain.';
    }
    
    if (lowerMessage.includes('tax')) {
      return 'Tax implications:\n\n• NGO donations may qualify for 80G deductions in India\n• Startup investments are subject to capital gains tax\n• We provide detailed transaction reports\n• Consult a tax professional for specific advice\n\nYou can download tax reports from your dashboard.';
    }
    
    return 'I understand your question. Let me connect you with more specific resources or a human support agent who can provide detailed assistance. You can also check our Help Center for comprehensive guides.';
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: simulateBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
        suggestions: quickActions.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 3)
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const markHelpful = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
  };

  const ChatInterface = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm">AI Support Assistant</div>
          <div className="text-xs text-muted-foreground">Usually responds instantly</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-line text-sm">{message.content}</div>
              </div>
              
              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1 px-2"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              {/* Helpful feedback for bot messages */}
              {message.sender === 'bot' && message.helpful === undefined && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Was this helpful?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => markHelpful(message.id, true)}
                  >
                    👍 Yes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => markHelpful(message.id, false)}
                  >
                    👎 No
                  </Button>
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              message.sender === 'user' ? 'order-1 ml-2 bg-gradient-to-r from-green-500 to-blue-500' : 'order-2 mr-2 bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              {message.sender === 'user' ? (
                <User className="h-3 w-3 text-white" />
              ) : (
                <Bot className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-muted-foreground">AI is typing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isTyping}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-1">
          {quickActions.slice(0, 3).map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={() => handleSuggestionClick(action)}
            >
              {action}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ChatInterface />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
            size="sm"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0">
          <div className="h-full">
            <ChatInterface />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 