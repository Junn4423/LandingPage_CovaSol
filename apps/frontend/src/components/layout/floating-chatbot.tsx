'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import clsx from 'clsx';

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const DEFAULT_BOT_MESSAGE = `Xin chào! 👋 Tôi là AI Chatbot COVA.
Hiện tôi đang trong giai đoạn **bảo trì**.
Vui lòng liên hệ qua:
• Zalo: 0559526824
• Mail: covasol.studio@gmail.com
Cảm ơn bạn đã kiên nhẫn chờ đợi! 🙏`;

interface FloatingChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  hidden?: boolean;
}

export function FloatingChatbot({ isOpen, onToggle, onClose, hidden = false }: FloatingChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot',
      content: DEFAULT_BOT_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new message or when chat opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll to bottom when chat window opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: trimmed,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Bot auto-reply after short delay
    setTimeout(() => {
      const botReply: ChatMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Cảm ơn bạn đã nhắn tin! 💬

Hiện tại hệ thống AI đang bảo trì.

Đội ngũ COVA sẽ phản hồi sớm nhất qua email hoặc Zalo. Xin cảm ơn! 🙏`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botReply]);
    }, 800);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Shift+Enter = new line
    if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      setInputValue(value.substring(0, start) + '\n' + value.substring(end));
      // Set cursor position after the newline
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }
    
    // Enter alone = send message
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-style bold **text** to <strong>
    return content.split('\n').map((line, i) => {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  // Ẩn hoàn toàn khi hidden=true
  if (hidden && !isOpen) {
    return null;
  }

  return (
    <div className={clsx('chatbot-fab', { open: isOpen })}>
      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-header__avatar">
                <i className="fas fa-robot" aria-hidden="true" />
              </div>
              <div className="chatbot-header__text">
                <span className="chatbot-header__name">COVA AI Assistant</span>
                <span className="chatbot-header__status">
                  <span className="status-dot status-dot--maintenance" />
                  Đang bảo trì
                </span>
              </div>
            </div>
            <button 
              type="button"
              className="chatbot-header__close"
              onClick={onClose}
              aria-label="Đóng chatbot"
            >
              <i className="fas fa-times" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={clsx('chatbot-message', {
                  'chatbot-message--user': msg.type === 'user',
                  'chatbot-message--bot': msg.type === 'bot'
                })}
              >
                {msg.type === 'bot' && (
                  <div className="chatbot-message__avatar">
                    <i className="fas fa-robot" aria-hidden="true" />
                  </div>
                )}
                <div className="chatbot-message__bubble">
                  {formatMessageContent(msg.content)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              ref={textareaRef}
              className="chatbot-input__textarea"
              placeholder="Nhập tin nhắn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button 
              type="button"
              className="chatbot-input__send"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              aria-label="Gửi tin nhắn"
            >
              <i className="fas fa-paper-plane" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        type="button" 
        className={clsx('chatbot-fab__toggle', { open: isOpen })}
        aria-expanded={isOpen}
        onClick={onToggle}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        <i className={clsx('fas', isOpen ? 'fa-times' : 'fa-comment-dots')} aria-hidden="true" />
      </button>
    </div>
  );
}
