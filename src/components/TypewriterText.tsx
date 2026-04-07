import React from 'react';
import { motion } from 'motion/react';

export const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0.02 }) => {
  return (
    <motion.span>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * delay }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};
