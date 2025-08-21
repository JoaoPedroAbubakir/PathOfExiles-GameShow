'use client';

import React, { useEffect, useState } from 'react';
import { Player } from '@/app/types/player';
import Image from 'next/image';

interface ScoreboardProps {
  className?: string;
  isLeftTeam?: boolean | null; // null for center player
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ className = '', isLeftTeam = true }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<{ pointsName?: string }>({});

  useEffect(() => {
    let eventSource: EventSource;

    const setupEventSource = () => {
      eventSource = new EventSource('/api/players/events');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const allPlayers = data.sort((a: Player, b: Player) => b.score - a.score);
        
        // Filter players based on position (left, center, right)
        if (isLeftTeam === true) {
          setPlayers([allPlayers[0]].filter(Boolean));
        } else if (isLeftTeam === false) {
          setPlayers([allPlayers[2]].filter(Boolean));
        } else {
          setPlayers([allPlayers[1]].filter(Boolean));
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setTimeout(setupEventSource, 5000); // Try to reconnect after 5 seconds
      };
    };

    const fetchInitialData = async () => {
      try {
        // Fetch initial data
        const [playersRes, settingsRes] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/settings')
        ]);

        if (playersRes.ok && settingsRes.ok) {
          const [playersData, settingsData] = await Promise.all([
            playersRes.json(),
            settingsRes.json()
          ]);

          const allPlayers = playersData.sort((a: Player, b: Player) => b.score - a.score);
          
          // Filter players based on position (left, center, right)
          if (isLeftTeam === true) {
            setPlayers([allPlayers[0]].filter(Boolean));
          } else if (isLeftTeam === false) {
            setPlayers([allPlayers[2]].filter(Boolean));
          } else {
            setPlayers([allPlayers[1]].filter(Boolean));
          }
          
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
    setupEventSource();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isLeftTeam]);

  if (players.length === 0) {
    return null;
  }

  return (
    <div className={`${className} flex flex-col gap-4`}>
      {players.map((player) => (
        <div key={player.id} className="bg-[#493e34] p-4 rounded-lg border-2 border-[#1e1915]">
          <div className="relative">
            {/* Player camera/image area */}
            <div className="aspect-[4/3] bg-[#342d26] rounded-lg mb-2">
              <Image
                src={player.icon}
                alt={player.name}
                width={300}
                height={225}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            
            {/* Name and Score display */}
            <div className="space-y-2">
              <div className="text-white text-lg font-semibold">{player.name}</div>
              <div className="text-right text-yellow-400 font-bold text-2xl">
                {player.score} {settings.pointsName || 'POINTS'}
              </div>
            </div>
            
            {/* Inventory display */}
            {player.inventory && player.inventory.length > 0 && (
              <div className="flex justify-end items-center gap-2 text-white mt-2 pt-2 border-t border-[#342d26]">
                {player.inventory.map((item) => (
                  <span key={item.id} className="flex items-center gap-1 bg-[#342d26] px-2 py-1 rounded">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={24}
                      height={24}
                      className="inline-block"
                    />
                    <span>{item.count || 0}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
