'use client';

import React from 'react';

interface AvatarLetterProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'indigo' | 'emerald' | 'amber';
}

export function AvatarLetter({ name, size = 'md', color = 'blue' }: AvatarLetterProps) {
  // Extract initial letter
  const cleanName = (name || 'K').trim();
  const words = cleanName.split(' ');
  const lastWord = words[words.length - 1];
  const letter = (lastWord ? lastWord[0] : cleanName[0] || 'K').toUpperCase();

  const sizeClasses = {
    sm: 'w-6 h-6 text-[11px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  const colorClasses = {
    blue: 'bg-blue-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-600 text-white',
  }[color];

  return (
    <div
      className={`${sizeClasses} ${colorClasses} rounded-full flex items-center justify-center font-bold shrink-0 shadow-2xs select-none`}
    >
      {letter}
    </div>
  );
}
