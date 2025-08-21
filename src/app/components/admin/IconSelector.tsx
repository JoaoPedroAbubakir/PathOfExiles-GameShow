import React from 'react';
import Image from 'next/image';

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
  className?: string;
}

const icons = [
  '/vercel.svg',
  '/file.svg',
  '/globe.svg',
  '/window.svg',
];

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelect, className = '' }) => {
  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      {icons.map((icon) => (
        <button
          key={icon}
          onClick={() => onSelect(icon)}
          className={`p-2 rounded-lg border-2 hover:bg-gray-700 transition-colors ${
            selectedIcon === icon ? 'border-blue-500 bg-gray-700' : 'border-gray-700'
          }`}
        >
          <div className="relative w-8 h-8">
            <Image
              src={icon}
              alt="Player icon"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
        </button>
      ))}
    </div>
  );
};
