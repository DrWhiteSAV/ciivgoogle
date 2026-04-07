import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, MapPin, Globe, Shield, Zap, History as HistoryIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GameState } from '../types/game';

interface ProfilePageProps {
  gameState: GameState;
  isObserverMode: boolean;
  setIsObserverMode: (val: boolean) => void;
  setObserverYearsToDeduct: (years: number) => void;
  resetGame: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  gameState, 
  isObserverMode, 
  setIsObserverMode,
  setObserverYearsToDeduct,
  resetGame
}) => {
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetGame();
    navigate('/setup');
  };
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl flex flex-col items-center"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-light glow-gold mb-4 uppercase tracking-widest">Профиль Наблюдателя</h2>
        <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">Ваши данные в системе управления мирами</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
        {/* Telegram Account Info */}
        <div className="p-8 bg-gold/5 border border-gold/20 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-gold group-hover:opacity-10 transition-opacity">
            <Globe size={120} />
          </div>
          <div className="w-20 h-20 rounded-full border-2 border-gold/30 p-1 mb-4 relative z-10">
            <img 
              src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-xl font-medium text-gold mb-1 uppercase tracking-widest">Связь с Эфиром</h3>
          <p className="text-[10px] text-white/40 mb-6 uppercase tracking-widest font-mono">Telegram Идентификатор</p>
          
          <div className="w-full space-y-3 text-left font-mono text-[11px]">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/30 uppercase tracking-tighter">Имя Сущности:</span>
              <span className="text-white/80">Shishkarnem</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/30 uppercase tracking-tighter">Код Доступа (ID):</span>
              <span className="text-white/80">1987245169</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/30 uppercase tracking-tighter">Псевдоним:</span>
              <span className="text-gold">@shishkarnem</span>
            </div>
            <a 
              href="https://t.me/shishkarnem" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 w-full py-3 bg-gold/10 border border-gold/30 text-gold rounded-xl flex items-center justify-center gap-2 hover:bg-gold/20 transition-all uppercase tracking-widest text-[10px] font-bold"
            >
              <Globe size={14} /> Открыть канал связи
            </a>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Mail size={120} className="text-gold" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center border border-gold/30">
                <Mail size={32} className="text-gold" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gold">Google Account</h3>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">{gameState.prayers > 0 ? 'shishkarnem@gmail.com' : 'shishkarnem@gmail.com'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/60">
                <Shield size={16} className="text-gold/60" />
                <span className="text-sm">Статус: Верифицирован</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <HistoryIcon size={16} className="text-gold/60" />
                <span className="text-sm">Активность: 144 сессии</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Zap size={16} className="text-gold/60" />
                <span className="text-sm">Ранг: Создатель Миров</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Stats Summary */}
      <div className="mt-12 w-full p-8 bg-gold/5 border border-gold/20 rounded-3xl backdrop-blur-md">
        <h3 className="text-lg font-mono text-gold uppercase tracking-widest mb-6 text-center">Статистика текущей сессии</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-2xl font-mono text-white mb-1">{gameState.year}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Лет прошло</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-white mb-1">{gameState.skills.length}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Навыков открыто</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-white mb-1">{gameState.chronicles.length}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Записей в летописи</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-white mb-1">{gameState.prayers}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Молитв накоплено</div>
          </div>
        </div>
      </div>

      {/* Reset Game Section */}
      <div className="mt-12 w-full flex flex-col items-center">
        {!showResetConfirm ? (
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all uppercase tracking-widest text-xs font-bold"
          >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            Сбросить прогресс игры
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-red-500/10 border border-red-500/50 rounded-3xl backdrop-blur-xl flex flex-col items-center text-center max-w-md"
          >
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Вы уверены?</h4>
            <p className="text-white/60 text-sm mb-8">
              Весь прогресс цивилизации будет удален. Вы вернетесь на этап создания мира.
              <br />
              <span className="text-gold font-bold">Баланс лет и молитв будет сохранен.</span>
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all uppercase tracking-widest text-[10px] font-bold"
              >
                Отмена
              </button>
              <button 
                onClick={handleReset}
                className="flex-1 py-3 bg-red-500 border border-red-600 text-white rounded-xl hover:bg-red-600 transition-all uppercase tracking-widest text-[10px] font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Да, сбросить
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
