"use client";

import { useState, useEffect } from 'react';
import { FaPlus, FaHistory, FaBars, FaTimes, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';

interface SidebarProps {
  onNewChat: () => void;
  chatHistory: { id: number; preview: string; messages: any[] }[];
  currentChatId: number | null;
  onSelectChat: (id: number) => void;
  onRemoveChat: (id: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  chatHistory, 
  currentChatId,
  onSelectChat,
  onRemoveChat 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 1024);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
      if (window.innerWidth <= 1024) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarContent = (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNewChat();
        }}
        className={`${isExpanded ? 'w-full' : 'w-8 h-8'} flex items-center justify-center gap-2 p-1.5 mb-4 rounded-lg transition-all duration-300 bg-zinc-700 hover:bg-zinc-600 text-white mx-auto`}
      >
        <FaPlus size={14} />
        {isExpanded && 'New Chat'}
      </button>
      
      {isExpanded && <div className="space-y-2">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            onClick={(e) => {
              e.stopPropagation();
              if (window.stopSpeechAndRecognition) {
                window.stopSpeechAndRecognition();
                if (window.playaudioRef) {
                  window.playaudioRef.pause();
                  window.playaudioRef.currentTime = 0;
                }
                speechSynthesis.cancel();
              }
              onSelectChat(chat.id);
              if (windowWidth < 768) {
                setIsMobileMenuOpen(false);
              }
            }}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              currentChatId === chat.id
                ? 'bg-zinc-600 text-white'
                : 'text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center min-w-0">
                  <FaHistory className="flex-shrink-0" />
                  {isExpanded && <span className="ml-2 truncate">{chat.preview || 'New Chat'}</span>}
                </div>
                {isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveChat(chat.id);
                    }}
                    className="p-2 rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-all duration-300"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>}
    </>
  );

  // Mobile menu button
  const mobileMenuButton = (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-700 text-white"
    >
      {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
    </button>
  );

  return (
    <>
      {mobileMenuButton}
      
      {/* Desktop sidebar */}
      <div className={`hidden md:flex flex-col ${isExpanded ? 'w-64' : 'w-10'} h-full bg-zinc-800 border-r border-midnight p-2 transition-all duration-300 relative shrink-0`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-4 transform bg-zinc-800 p-1.5 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors z-50 flex items-center justify-center"
        >
          {isExpanded ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
        </button>
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-64 h-full bg-zinc-800 p-4 transform transition-transform duration-300"
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
