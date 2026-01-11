import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle, Sparkles, MoreHorizontal } from 'lucide-react';
import { Message, Persona, TariffLevel } from '../types';
import { generateTherapyResponse, checkEmergency } from '../services/geminiService';
import { EMERGENCY_CONTACTS } from '../constants';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
    tariff: TariffLevel;
    onEmergencyTrigger: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ tariff, onEmergencyTrigger }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'model',
            text: 'Здравствуйте. Я MindHelper. Как вы себя чувствуете сегодня? Я здесь, чтобы выслушать вас без осуждения.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [persona, setPersona] = useState<Persona>(Persona.EMPATHIC);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');

        // 1. Check for emergency keywords locally first for speed
        if (checkEmergency(userText)) {
            onEmergencyTrigger();
            // We still continue to chat, but the parent handles the overlay
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const aiResponseText = await generateTherapyResponse(messages, userText, persona, tariff);
            
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: aiResponseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "Простите, возникла ошибка связи. Попробуйте еще раз.",
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 rounded-full">
                        <Bot className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-800">ИИ Психолог</h2>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-500">Онлайн • Тариф {tariff.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                     <select 
                        value={persona} 
                        onChange={(e) => setPersona(e.target.value as Persona)}
                        className="text-sm border-gray-200 rounded-lg py-1 px-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                        <option value={Persona.EMPATHIC}>Эмпатия</option>
                        <option value={Persona.CBT}>КПТ (Когнитивная)</option>
                        <option value={Persona.MINDFULNESS}>Осознанность</option>
                        <option value={Persona.COACH}>Коучинг</option>
                    </select>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                                msg.role === 'user'
                                    ? 'bg-teal-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}
                        >
                            <ReactMarkdown 
                                className={`prose text-sm ${msg.role === 'user' ? 'prose-invert' : 'prose-gray'}`}
                                components={{
                                    p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                            <span className={`text-[10px] block mt-1 ${msg.role === 'user' ? 'text-teal-100' : 'text-gray-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 rounded-bl-none shadow-sm flex items-center gap-2">
                           <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                           <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Опишите, что вы чувствуете..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none h-14 bg-gray-50 scrollbar-hide"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 text-center">
                     <p className="text-[10px] text-gray-400">
                        ИИ может совершать ошибки. При критических ситуациях используйте команду SOS.
                    </p>
                </div>
            </div>
        </div>
    );
};