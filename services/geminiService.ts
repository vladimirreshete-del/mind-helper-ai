import { GoogleGenAI } from "@google/genai";
import { Message, Persona, TariffLevel } from '../types';
import { SYSTEM_INSTRUCTION_BASE, PERSONA_PROMPTS } from '../constants';

const getClient = () => {
    // In a Web Service deployment on Render:
    // 1. If using Vite to build: We can use import.meta.env.VITE_API_KEY
    // 2. Ideally, we should move AI calls to the backend (server.js) to hide the key entirely.
    // For now, to keep the frontend working as is, ensure VITE_API_KEY is set in Render Environment Variables.
    
    // Note: Render exposes standard env vars. Vite requires VITE_ prefix for client-side usage.
    const apiKey = import.meta.env.VITE_API_KEY; 
    
    if (!apiKey) {
        console.error("API Key is missing. Set VITE_API_KEY in Render Environment Variables.");
    }
    return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateTherapyResponse = async (
    history: Message[],
    currentMessage: string,
    persona: Persona,
    tariff: TariffLevel
): Promise<string> => {
    try {
        const ai = getClient();
        
        let specificInstruction = PERSONA_PROMPTS[persona];
        
        if (tariff === 'free') {
            specificInstruction += "\n[ОГРАНИЧЕНИЕ ТАРИФА: Твои ответы должны быть краткими и общими. Не углубляйся в детальный психоанализ. Напоминай иногда, что это пробная версия.]";
        } else if (tariff === 'pro' || tariff === 'premium') {
             specificInstruction += "\n[ТВОЙ УРОВЕНЬ: Максимально глубокий и персонализированный анализ.]";
        }

        const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n\nСпециализация на текущую сессию: ${specificInstruction}`;
        
        const modelName = tariff === 'premium' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [
                ...history.slice(-10).map(msg => ({ 
                    role: msg.role,
                    parts: [{ text: msg.text }]
                })),
                {
                    role: 'user',
                    parts: [{ text: currentMessage }]
                }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7, 
            }
        });

        return response.text || "Извините, я задумался. Повторите, пожалуйста.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Произошла ошибка соединения с сервером или неверный API ключ.";
    }
};

export const checkEmergency = (text: string): boolean => {
    const keywords = ['суицид', 'убить себя', 'не хочу жить', 'смерть', 'покончить', 'насилие', 'селфхарм'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
};