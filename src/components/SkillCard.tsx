import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Atom } from 'lucide-react';
import { Skill } from '../types';

export const SkillCard = React.memo(({ skill, index, color }: { skill: Skill, index: number, color: 'gold' | 'red' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative group w-full max-w-sm"
  >
    <div className={`p-6 rounded-2xl border ${color === 'gold' ? 'border-gold/20 bg-gold/5' : 'border-red-500/20 bg-red-500/5'} backdrop-blur-md transition-all cursor-help relative overflow-hidden`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color === 'gold' ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'}`}>
          {color === 'gold' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Год {skill.year}</span>
            <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${color === 'gold' ? 'border-gold/30 text-gold' : 'border-red-500/30 text-red-500'}`}>
              {color === 'gold' ? 'ПРОГРЕСС' : 'РЕГРЕСС'}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white mb-2">{skill.name}</h4>
          <p className="text-xs text-white/60 leading-relaxed">{skill.desc}</p>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className={`absolute -right-4 -bottom-4 opacity-5 ${color === 'gold' ? 'text-gold' : 'text-red-500'}`}>
        <Atom size={80} />
      </div>
    </div>
  </motion.div>
));
SkillCard.displayName = 'SkillCard';
