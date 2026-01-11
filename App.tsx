import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  BarChart2, 
  CreditCard, 
  Settings, 
  Menu, 
  X,
  Phone,
  BookOpen
} from 'lucide-react';

import { ChatInterface } from './components/ChatInterface';
import { MoodTracker } from './components/MoodTracker';
import { Tariffs } from './components/Tariffs';
import { EmergencyModal } from './components/EmergencyModal';
import { TariffLevel } from './types';

type Tab = 'chat' | 'mood' | 'therapy' | 'tariffs';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTariff, setCurrentTariff] = useState<TariffLevel>('free');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [telegramUser, setTelegramUser] = useState<{name: string, username?: string} | null>(null);

  // Initialize Telegram Web App
  useEffect(() => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Extract user data from Telegram
        const user = tg.initDataUnsafe?.user;
        if (user) {
            setTelegramUser({
                name: user.first_name,
                username: user.username
            });
        }
    }
  }, []);

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-teal-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg shadow-sm"></div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">MindHelper AI</h1>
          </div>
          
          <nav className="space-y-2">
            <NavItem id="chat" icon={MessageCircle} label="Разговор" />
            <NavItem id="mood" icon={BarChart2} label="Настроение" />
            <NavItem id="therapy" icon={BookOpen} label="Упражнения" />
            <NavItem id="tariffs" icon={CreditCard} label="Тарифы" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 space-y-3">
             <button 
                onClick={() => setIsEmergencyOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium border border-red-100"
            >
                <Phone className="w-4 h-4" />
                <span>SOS</span>
            </button>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                   {telegramUser ? telegramUser.name[0] : 'U'}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-700 truncate max-w-[100px]">
                        {telegramUser ? telegramUser.name : 'User'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{currentTariff} Plan</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Mobile Header & Menu Overlay */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-md"></div>
            <h1 className="text-lg font-bold text-gray-800">MindHelper</h1>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
            {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-30 pt-20 px-6 space-y-4 animate-in slide-in-from-top-10">
             {telegramUser && (
                <div className="mb-6 p-4 bg-teal-50 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center text-teal-800 font-bold">
                        {telegramUser.name[0]}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Привет, {telegramUser.name}!</p>
                        <p className="text-xs text-gray-500">Тариф: {currentTariff}</p>
                    </div>
                </div>
            )}
            <NavItem id="chat" icon={MessageCircle} label="Разговор" />
            <NavItem id="mood" icon={BarChart2} label="Настроение" />
             <NavItem id="therapy" icon={BookOpen} label="Упражнения" />
            <NavItem id="tariffs" icon={CreditCard} label="Тарифы" />
             <button 
                onClick={() => { setIsEmergencyOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl mt-8 font-bold"
            >
                <Phone className="w-5 h-5" />
                <span>SOS Поддержка</span>
            </button>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full pt-16 md:pt-0 overflow-hidden relative">
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          {activeTab === 'chat' && (
             <div className="h-full max-w-4xl mx-auto">
                <ChatInterface 
                    tariff={currentTariff} 
                    onEmergencyTrigger={() => setIsEmergencyOpen(true)}
                />
             </div>
          )}
          
          {activeTab === 'mood' && (
             <div className="h-full max-w-5xl mx-auto">
                 <MoodTracker />
             </div>
          )}

          {activeTab === 'tariffs' && (
              <div className="h-full max-w-6xl mx-auto">
                  <Tariffs currentTariff={currentTariff} onSelect={setCurrentTariff} />
              </div>
          )}

          {activeTab === 'therapy' && (
               <div className="h-full flex items-center justify-center text-center p-8">
                   <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg">
                       <BookOpen className="w-16 h-16 text-teal-200 mx-auto mb-6" />
                       <h2 className="text-2xl font-bold text-gray-800 mb-2">Библиотека упражнений</h2>
                       <p className="text-gray-500 mb-6">Этот раздел находится в разработке. Скоро здесь появятся медитации, техники дыхания и КПТ-дневники.</p>
                       <button onClick={() => setActiveTab('chat')} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                           Вернуться к чату
                       </button>
                   </div>
               </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </div>
  );
};

export default App;