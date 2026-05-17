import { createContext, useContext, ReactNode } from 'react';
import { useChatBot } from '../hooks/useChatBot';

interface ChatBotContextType {
  isOpen: boolean;
  toggle: () => void;
  messages: Array<{ role: 'user' | 'assistant'; content: string; navLink?: string }>;
  sendMessage: (content: string) => void;
  isTyping: boolean;
  navigateTo: (path: string) => void;
}

const ChatBotContext = createContext<ChatBotContextType | null>(null);

export function ChatBotProvider({ children }: { children: ReactNode }) {
  const chatBot = useChatBot();
  return (
    <ChatBotContext.Provider value={chatBot}>
      {children}
    </ChatBotContext.Provider>
  );
}

export function useChatBotContext() {
  const context = useContext(ChatBotContext);
  if (!context) throw new Error('useChatBotContext must be used within ChatBotProvider');
  return context;
}
