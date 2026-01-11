import { Message, Persona, TariffLevel } from '../types';

export const generateTherapyResponse = async (
    history: Message[],
    currentMessage: string,
    persona: Persona,
    tariff: TariffLevel
): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                history,
                message: currentMessage,
                persona,
                tariff
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.text || "Извините, я задумался. Повторите, пожалуйста.";
    } catch (error) {
        console.error("Chat API Error:", error);
        throw error; // Re-throw to be handled by the component
    }
};

export const checkEmergency = (text: string): boolean => {
    const keywords = ['суицид', 'убить себя', 'не хочу жить', 'смерть', 'покончить', 'насилие', 'селфхарм'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
};