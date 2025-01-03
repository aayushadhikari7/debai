"use client";

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

  const handleNewChat = () => {
    const newChatId = Date.now();
    setChatHistory(prev => [...prev, { 
      id: newChatId, 
      preview: 'New Chat',
      messages: []
    }]);
    setCurrentChatId(newChatId);
  };

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
    <main className="flex h-screen overflow-hidden">
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
        />
      </div>
    </main>
  );
}
