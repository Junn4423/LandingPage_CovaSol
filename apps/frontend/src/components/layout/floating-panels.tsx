'use client';

import { useState, createContext, useContext } from 'react';
import { FloatingContactFab } from './floating-contact';
import { FloatingChatbot } from './floating-chatbot';

type FloatingPanel = 'none' | 'contact' | 'chatbot';

interface FloatingContextType {
  activePanel: FloatingPanel;
  setActivePanel: (panel: FloatingPanel) => void;
}

const FloatingContext = createContext<FloatingContextType>({
  activePanel: 'none',
  setActivePanel: () => {}
});

export function useFloatingPanel() {
  return useContext(FloatingContext);
}

export function FloatingPanels() {
  const [activePanel, setActivePanel] = useState<FloatingPanel>('none');

  const handleContactToggle = () => {
    setActivePanel(prev => prev === 'contact' ? 'none' : 'contact');
  };

  const handleChatbotToggle = () => {
    setActivePanel(prev => prev === 'chatbot' ? 'none' : 'chatbot');
  };

  const handleClose = () => {
    setActivePanel('none');
  };

  // Ẩn chatbot button khi contact menu đang mở
  const hideChatbot = activePanel === 'contact';

  return (
    <FloatingContext.Provider value={{ activePanel, setActivePanel }}>
      <FloatingContactFab 
        isOpen={activePanel === 'contact'}
        onToggle={handleContactToggle}
        onClose={handleClose}
      />
      <FloatingChatbot 
        isOpen={activePanel === 'chatbot'}
        onToggle={handleChatbotToggle}
        onClose={handleClose}
        hidden={hideChatbot}
      />
    </FloatingContext.Provider>
  );
}
