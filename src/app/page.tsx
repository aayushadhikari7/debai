"use client";

declare global {
  interface Window {
    removeCurrentChat?: () => void;
  }
}

import { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import Sidebar from '../components/Sidebar';

interface ChatData {
  id: number;
  preview: string;
  messages: { isUser: boolean; text: string }[];
}

export default function Home() {
  const [chatHistory, setChatHistory] = useState<ChatData[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory');
    const savedCurrentChat = localStorage.getItem('currentChatId');
    
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }
    if (savedCurrentChat) {
      setCurrentChatId(Number(savedCurrentChat));
    }
  }, []);

  // Save to localStorage whenever chat history or current chat changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId.toString());
    }
  }, [chatHistory, currentChatId]);

  const handleNewChat = (initialMessage?: string, title?: string) => {
    const newChatId = Date.now();
    setChatHistory(prev => [...prev, { 
      id: newChatId, 
      preview: title || initialMessage || 'New Chat',
      messages: initialMessage ? [{ isUser: true, text: initialMessage }] : []
    }]);
    setCurrentChatId(newChatId);
  };

  const generateChatTitle = async (message: string) => {
    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: `Generate a short, concise title (max 4-5 words) for a conversation that starts with: "${message}"`
        }),
      });
      const data = await response.json();
      return data.response.slice(0, 50); // Limit title length
    } catch (error) {
      console.error('Error generating title:', error);
      return message.slice(0, 30) + '...'; // Fallback to truncated message
    }
  };

  const handleFirstMessage = async (message: string) => {
    if (!currentChatId) {
      const title = await generateChatTitle(message);
      handleNewChat(message, title);
    }
  };

  // Expose removeCurrentChat globally
  useEffect(() => {
    window.removeCurrentChat = () => {
      if (currentChatId) {
        handleRemoveChat(currentChatId);
      }
    };
    return () => {
      window.removeCurrentChat = undefined;
    };
  }, [currentChatId]);

  const handleRemoveChat = (chatId: number) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const updateChatPreview = (chatId: number, messages: { isUser: boolean; text: string }[]) => {
    setChatHistory(prev => prev.map(chat => {
      if (chat.id === chatId) {
        // Get the first user message as preview, or use default
        const firstUserMessage = messages.find(m => m.isUser)?.text;
        return {
          ...chat,
          preview: firstUserMessage ? 
            (firstUserMessage.length > 30 ? 
              `${firstUserMessage.substring(0, 30)}...` : 
              firstUserMessage) : 
            'New Chat',
          messages
        };
      }
      return chat;
    }));
  };

  const getCurrentChat = () => {
    return chatHistory.find(chat => chat.id === currentChatId)?.messages || [];
  };

  return (
    <main className="flex h-screen overflow-hidden pt-16 bg-zinc-900">
      <Sidebar 
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onRemoveChat={handleRemoveChat}
      />
      <div className="flex-1">
        <Chat 
          messages={getCurrentChat()}
          onMessagesUpdate={(messages) => {
            if (currentChatId) {
              updateChatPreview(currentChatId, messages);
            }
          }}
          onFirstMessage={handleFirstMessage}
        />
      </div>
    </main>
  );
}
