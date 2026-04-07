import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number; // characters per second
  onComplete?: () => void;
  skip?: boolean;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  speed = 30, 
  onComplete,
  skip = false
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (skip) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      if (currentIndex < text.length) {
        onComplete?.();
      }
      return;
    }

    if (currentIndex < text.length) {
      const delay = 1000 / speed;
      timerRef.current = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
    } else if (currentIndex === text.length && text.length > 0) {
      onComplete?.();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, text, speed, onComplete, skip]);

  // Reset if text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <>{displayedText}</>;
};
