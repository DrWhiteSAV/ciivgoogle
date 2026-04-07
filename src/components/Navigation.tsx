import React from 'react';
import { motion } from 'motion/react';
import { Baby, History as HistoryIcon, TreePine } from 'lucide-react';

export const Navigation: React.FC<{
  activeSection: 'genesis' | 'fate' | 'tree';
  setActiveSection: (section: 'genesis' | 'fate' | 'tree') => void;
}> = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/60 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex justify-around items-center rounded-t-3xl">
      <button 
        onClick={() => setActiveSection('genesis')}
        className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'genesis' ? 'text-gold' : 'text-white/40'}`}
      >
        <Baby size={20} />
        <span className="text-[10px] font-mono uppercase tracking-widest">Генезис</span>
        {activeSection === 'genesis' && <motion.div layoutId="nav-glow" className="w-1 h-1 bg-gold rounded-full glow-gold" />}
      </button>
      <button 
        onClick={() => setActiveSection('fate')}
        className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'fate' ? 'text-gold' : 'text-white/40'}`}
      >
        <HistoryIcon size={20} />
        <span className="text-[10px] font-mono uppercase tracking-widest">Ткач</span>
        {activeSection === 'fate' && <motion.div layoutId="nav-glow" className="w-1 h-1 bg-gold rounded-full glow-gold" />}
      </button>
      <button 
        onClick={() => setActiveSection('tree')}
        className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'tree' ? 'text-gold' : 'text-white/40'}`}
      >
        <TreePine size={20} />
        <span className="text-[10px] font-mono uppercase tracking-widest">Дерево Жизни</span>
        {activeSection === 'tree' && <motion.div layoutId="nav-glow" className="w-1 h-1 bg-gold rounded-full glow-gold" />}
      </button>
    </nav>
  );
};
