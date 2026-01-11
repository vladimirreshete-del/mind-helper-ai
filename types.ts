export type Role = 'user' | 'model';

export type TariffLevel = 'free' | 'basic' | 'pro' | 'premium';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface MoodEntry {
  id: string;
  score: number; // 1-10
  emotions: string[];
  note: string;
  date: string;
}

export interface TariffPlan {
  id: TariffLevel;
  name: string;
  price: string;
  features: string[];
  exclusive: string[];
  color: string;
}

export enum Persona {
  EMPATHIC = 'empathic',
  CBT = 'cbt', // Cognitive Behavioral Therapy
  MINDFULNESS = 'mindfulness',
  COACH = 'coach'
}

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
}

// Telegram Web App Types
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    initDataUnsafe?: {
        user?: TelegramUser;
    };
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        show: () => void;
        hide: () => void;
        onClick: (callback: () => void) => void;
    };
    themeParams: {
        bg_color?: string;
        text_color?: string;
        hint_color?: string;
        link_color?: string;
        button_color?: string;
        button_text_color?: string;
        secondary_bg_color?: string;
    };
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}