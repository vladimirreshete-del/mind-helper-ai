import React from 'react';
import { TARIFFS } from '../constants';
import { TariffLevel } from '../types';
import { Check, Star } from 'lucide-react';

interface TariffsProps {
    currentTariff: TariffLevel;
    onSelect: (id: TariffLevel) => void;
}

export const Tariffs: React.FC<TariffsProps> = ({ currentTariff, onSelect }) => {
    return (
        <div className="h-full overflow-y-auto p-2">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Выберите план поддержки</h2>
                <p className="text-gray-500">Инвестируйте в свое ментальное здоровье</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TARIFFS.map((plan) => (
                    <div 
                        key={plan.id}
                        className={`relative rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col ${
                            currentTariff === plan.id 
                                ? 'border-teal-500 shadow-lg transform scale-[1.02] bg-white' 
                                : `${plan.color} hover:border-teal-200 hover:shadow-md`
                        }`}
                    >
                        {currentTariff === plan.id && (
                            <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                                ТЕКУЩИЙ
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                            <p className="text-teal-700 font-semibold mt-1">{plan.price}</p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                            {plan.exclusive.length > 0 && (
                                <li className="pt-2 border-t border-gray-200 mt-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Эксклюзив</span>
                                </li>
                            )}
                            {plan.exclusive.map((feature, idx) => (
                                <li key={`ex-${idx}`} className="flex items-start gap-2 text-sm text-purple-700 font-medium">
                                    <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => onSelect(plan.id)}
                            className={`w-full py-2 rounded-xl font-medium transition-colors ${
                                currentTariff === plan.id 
                                    ? 'bg-teal-100 text-teal-700 cursor-default' 
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                        >
                            {currentTariff === plan.id ? 'Активен' : 'Выбрать'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};