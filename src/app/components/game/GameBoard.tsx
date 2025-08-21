'use client';

import React from 'react';

interface GameBoardProps {
  tileCount: number;
  backgroundImage: string;
  onTileClick: (tileNumber: number) => void;
  revealedTiles: number[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  tileCount, 
  backgroundImage, 
  onTileClick, 
  revealedTiles 
}) => {
  const columns = Math.ceil(Math.sqrt(tileCount));

  return (
    <div className="relative w-full aspect-square">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.5 }}
      />
      <div
        className="grid gap-1 relative z-10"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {Array.from({ length: tileCount }).map((_, index) => {
          const tileNumber = index + 1;
          return (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center 
                ${revealedTiles.includes(tileNumber) 
                  ? 'bg-transparent cursor-default' 
                  : 'bg-gray-800 cursor-pointer hover:bg-gray-700'}
                transition-all duration-300 ease-in-out
              `}
              onClick={() => !revealedTiles.includes(tileNumber) && onTileClick(tileNumber)}
            >
              {!revealedTiles.includes(tileNumber) && (
                <span className="text-white text-2xl font-bold">{tileNumber}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
