import React from 'react';
import { Phone, X } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../constants';

interface EmergencyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-red-50 p-6 text-center border-b border-red-100">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Экстренная помощь</h2>
                    <p className="text-gray-700 text-sm">
                        Вы не одни. Если вам тяжело, пожалуйста, свяжитесь со специалистами прямо сейчас.
                    </p>
                </div>
                
                <div className="p-6 space-y-4">
                    {EMERGENCY_CONTACTS.map((contact, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition">
                            <div>
                                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                                <p className="text-xs text-gray-500">{contact.description}</p>
                            </div>
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium hover:bg-red-200 transition">
                                <Phone className="w-4 h-4" />
                                {contact.phone}
                            </a>
                        </div>
                    ))}
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
                        <p className="font-semibold mb-1">Дыхательная практика:</p>
                        Вдох на 4 счета, задержка на 7, выдох на 8. Повторите 3 раза.
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Закрыть окно
                    </button>
                </div>
            </div>
        </div>
    );
};