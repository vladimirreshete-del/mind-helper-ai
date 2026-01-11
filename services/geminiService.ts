import { GoogleGenAI } from "@google/genai";
import { Message, Persona, TariffLevel } from '../types';
import { SYSTEM_INSTRUCTION_BASE, PERSONA_PROMPTS } from '../constants';

const getClient = () => {
    // According to guidelines, the API key must be obtained from process.env.API_KEY.
    // Assume it is valid and accessible.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTherapyResponse = async (
    history: Message[],
    currentMessage: string,
    persona: Persona,
    tariff: TariffLevel
): Promise<string> => {
    try {
        const ai = getClient();
        
        // Construct system instruction based on persona and tariff limits
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