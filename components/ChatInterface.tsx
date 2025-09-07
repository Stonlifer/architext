
import React, { useState, useEffect, useRef } from 'react';
import { RobotIcon } from './icons/RobotIcon';
import { LogoIcon } from './icons/LogoIcon';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
  type: 'text' | 'error';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isLoading, error }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your AI Architect. How can we refine this design? Try 'Make the kitchen bigger' or 'Add a window to the master bedroom'.", sender: 'ai', type: 'text' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      setMessages(prev => [...prev, { text: error, sender: 'ai', type: 'error' }]);
    }
  }, [error]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setMessages(prev => [...prev, { text: input, sender: 'user', type: 'text' }]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Design Chat</h3>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0"><RobotIcon className="w-5 h-5 text-brand-accent"/></div>}
            <div className={`max-w-xs md:max-w-sm rounded-lg p-3 ${
              msg.sender === 'user' ? 'bg-brand-secondary text-white rounded-br-none' :
              msg.type === 'error' ? 'bg-red-900/80 text-red-200 rounded-bl-none' :
              'bg-gray-700 text-gray-200 rounded-bl-none'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0"><RobotIcon className="w-5 h-5 text-brand-accent"/></div>
               <div className="bg-gray-700 rounded-lg p-3 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                        <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
               </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe your change..."
          className="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none"
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-brand-secondary text-white font-bold p-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-10 h-10">
          <LogoIcon className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;