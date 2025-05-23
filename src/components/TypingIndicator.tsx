'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  name: string;
}

export default function TypingIndicator({ name }: TypingIndicatorProps) {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: [-2, 2, -2] },
  };

  const transition = {
    duration: 1.2,
    repeat: Infinity,
    ease: 'easeInOut',
  };

  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm p-2">
      <span className="font-medium">{name}</span>
      <span>is typing</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              ...transition,
              delay: i * 0.2,
            }}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
} 