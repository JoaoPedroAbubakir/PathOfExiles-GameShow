'use client';

import React from 'react';
import { Scoreboard } from './Scoreboard';

export const GameBoard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d0b09] p-8">
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-8 max-w-[1920px] mx-auto">
        {/* Left player */}
        <div>
          <Scoreboard isLeftTeam={true} />
        </div>

        {/* Center content with questions grid */}
        <div className="grid grid-cols-2 gap-4 aspect-square">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="relative">
              <div className="absolute inset-0 bg-[#342d26] rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-8xl font-bold opacity-20">
                  {num}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right side players */}
        <div className="space-y-4">
          <Scoreboard isLeftTeam={false} className="mb-4" />
          <Scoreboard isLeftTeam={null} />
        </div>
      </div>
    </div>
  );
};
