'use client';

import React, { useEffect, useState } from 'react';
import { Player } from '@/app/types/player';
import Image from 'next/image';

interface ScoreboardProps {
  className?: string;
  isLeftTeam?: boolean | null;
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
        setTimeout(setupEventSource, 5000);
      };
    };

    const fetchInitialData = async () => {
      try {
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
        <div key={player.id} className="bg-[#493e34] p-3 rounded-lg border-2 border-[#1e1915]">
          <div className="relative">
            {/* Player camera/image area */}
            <div className="aspect-[4/3] bg-[#342d26] rounded-lg mb-2 h-[150px]">
              <Image
                src={player.icon || '/placeholder.png'}
                alt={player.name}
                width={200}
                height={150}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            
            {/* Player name and score */}
            <div className="flex justify-between items-center text-white mb-2">
              <div className="font-semibold truncate">{player.name}</div>
              <div className="font-bold">
                {player.score} {settings.pointsName || 'POINTS'}
              </div>
            </div>
            
            {/* Inventory display */}
            {player.inventory && player.inventory.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {player.inventory.map((item) => (
                  <span key={item.id} className="flex items-center gap-1 bg-[#342d26] px-2 py-1 rounded text-sm">
                    {item.icon && (
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={20}
                        height={20}
                        className="inline-block"
                      />
                    )}
                    <span className="text-white">{item.count || 0}</span>
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
