import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodEntry } from '../types';
import { EMOTION_TAGS } from '../constants';
import { Save, Plus } from 'lucide-react';

export const MoodTracker: React.FC = () => {
    // Mock data for visualization
    const [history, setHistory] = useState<MoodEntry[]>([
        { id: '1', score: 6, emotions: ['Спокойствие'], note: 'Обычный день', date: 'Пн' },
        { id: '2', score: 4, emotions: ['Усталость', 'Грусть'], note: 'Тяжелая работа', date: 'Вт' },
        { id: '3', score: 7, emotions: ['Радость'], note: 'Встреча с другом', date: 'Ср' },
        { id: '4', score: 5, emotions: ['Тревога'], note: 'Дедлайн', date: 'Чт' },
        { id: '5', score: 8, emotions: ['Воодушевление'], note: 'Выходной', date: 'Пт' },
    ]);

    const [currentScore, setCurrentScore] = useState(5);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [note, setNote] = useState('');

    const toggleEmotion = (tag: string) => {
        if (selectedEmotions.includes(tag)) {
            setSelectedEmotions(prev => prev.filter(e => e !== tag));
        } else {
            setSelectedEmotions(prev => [...prev, tag]);
        }
    };

    const handleSave = () => {
        const newEntry: MoodEntry = {
            id: Date.now().toString(),
            score: currentScore,
            emotions: selectedEmotions,
            note: note,
            date: 'Сб' // In a real app, calculate "Today"
        };
        setHistory(prev => [...prev, newEntry]);
        // Reset form
        setSelectedEmotions([]);
        setNote('');
        alert("Запись сохранена!");
    };

    const getScoreColor = (score: number) => {
        if (score <= 3) return 'text-red-500';
        if (score <= 6) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-y-auto p-1">
            {/* Input Section */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Как вы сейчас?</h3>
                    
                    {/* Slider */}
                    <div className="mb-6 text-center">
                        <span className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>{currentScore}</span>
                        <p className="text-sm text-gray-500">из 10</p>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={currentScore}
                            onChange={(e) => setCurrentScore(parseInt(e.target.value))}
                            className="w-full mt-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>Плохо</span>
                            <span>Отлично</span>
                        </div>
                    </div>

                    {/* Emotions Tags */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">Эмоции</p>
                        <div className="flex flex-wrap gap-2">
                            {EMOTION_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleEmotion(tag)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        selectedEmotions.includes(tag)
                                            ? 'bg-teal-100 border-teal-300 text-teal-800'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="mb-6">
                         <p className="text-sm font-medium text-gray-700 mb-2">Заметки</p>
                         <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Что вызвало эти эмоции?"
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none h-24"
                         />
                    </div>

                    <button 
                        onClick={handleSave}
                        className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Сохранить
                    </button>
                </div>
            </div>

            {/* Chart & History Section */}
            <div className="md:col-span-2 space-y-6">
                {/* Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Динамика настроения</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#0d9488" 
                                strokeWidth={3} 
                                dot={{ fill: '#0d9488', strokeWidth: 2, r: 4, stroke: '#fff' }} 
                                activeDot={{ r: 6 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Entries */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Последние записи</h3>
                    <div className="space-y-4">
                        {[...history].reverse().slice(0, 3).map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                    entry.score > 6 ? 'bg-green-400' : entry.score > 3 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}>
                                    {entry.score}
                                </div>
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {entry.emotions.map(e => (
                                            <span key={e} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">{e}</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-700">{entry.note || "Нет заметок"}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{entry.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};