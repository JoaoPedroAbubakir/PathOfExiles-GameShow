'use client';

import React, { useState, useEffect } from 'react';
import { Player, InventoryItem } from '@/app/types/player';
import Image from 'next/image';
import { IconSelector } from './IconSelector';
import { InventoryManager } from './InventoryManager';

  export const PlayerManager: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', icon: '/vercel.svg' });
  const [editingPlayer, setEditingPlayer] = useState<{id: string, name: string, icon: string, inventory?: InventoryItem[]} | null>(null);
  const [pointsName, setPointsName] = useState('points');
  const [settings, setSettings] = useState<{ pointsName: string }>({ pointsName: 'points' });
  const [showInventory, setShowInventory] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);  const uploadIcon = async (playerId?: string, file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (playerId) {
          // Update existing player's icon
          updatePlayer(playerId, { icon: data.url });
        } else {
          // Set icon for new player
          setNewPlayer(prev => ({ ...prev, icon: data.url }));
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingIcon({ file: null });
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchSettings();
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setPointsName(data.pointsName || 'points');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, pointsName }),
      });
      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const addPlayer = async () => {
    if (!newPlayer.name.trim()) return;
    if (players.length >= 10) {
      alert('Maximum 10 players allowed');
      return;
    }

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      });

      if (response.ok) {
        await fetchPlayers();
        setNewPlayer({ name: '', icon: '/vercel.svg' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add player');
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      // If updating inventory, merge with existing inventory
      if (updates.inventory !== undefined) {
        const currentPlayer = players.find(p => p.id === id);
        if (currentPlayer) {
          if (updates.inventory.length === 0) {
            // If clearing inventory, keep as empty array
            updates = { ...updates, inventory: [] };
          } else {
            // Otherwise merge with existing inventory, combining counts for same items
            const existingInventory = currentPlayer.inventory || [];
            const mergedInventory = [...existingInventory];
            
            updates.inventory.forEach(newItem => {
              const existingItemIndex = mergedInventory.findIndex(item => item.id === newItem.id);
              if (existingItemIndex >= 0) {
                // Add to existing item count
                mergedInventory[existingItemIndex].count = (mergedInventory[existingItemIndex].count || 0) + (newItem.count || 1);
              } else {
                // Add new item
                mergedInventory.push({ ...newItem });
              }
            });
            
            updates = { ...updates, inventory: mergedInventory };
          }
        }
      }

      const response = await fetch('/api/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        await fetchPlayers();
        if (editingPlayer?.id === id) {
          setEditingPlayer(null);
        }
      }
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const removePlayer = async (id: string) => {
    try {
      const response = await fetch(`/api/players?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPlayers();
      }
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Player Management</h2>
      
      {/* Points Name Setting */}
      <div className="space-y-2">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Points Name
            </label>
            <input
              type="text"
              value={pointsName}
              onChange={(e) => setPointsName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded"
              placeholder="e.g., chaos"
            />
          </div>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Points Name
          </button>
        </div>
      </div>
      
      {/* Add Player Form */}
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              placeholder="Player name"
              maxLength={20}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
            />
            <button
              onClick={addPlayer}
              disabled={players.length >= 10}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Add Player
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Icon</label>
            <div className="flex gap-4 items-start">
              <IconSelector
                selectedIcon={newPlayer.icon}
                onSelect={(icon) => setNewPlayer({ ...newPlayer, icon })}
                className="w-fit"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Or Upload Custom Icon</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadIcon(undefined, file);
                    }
                  }}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="space-y-4">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative w-8 h-8">
                  <Image
                    src={player.icon}
                    alt={`${player.name}'s icon`}
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
                {editingPlayer?.id === player.id ? (
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingPlayer.name}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-700 text-white rounded ring-1 ring-blue-500"
                        maxLength={20}
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (editingPlayer.name.trim()) {
                            updatePlayer(player.id, { 
                              name: editingPlayer.name.trim(),
                              icon: editingPlayer.icon 
                            });
                          }
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Change Icon</label>
                      <div className="flex gap-4 items-start">
                        <IconSelector
                          selectedIcon={editingPlayer.icon}
                          onSelect={(icon) => setEditingPlayer({ ...editingPlayer, icon })}
                          className="w-fit"
                        />
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-400">Or Upload Custom Icon</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadIcon(editingPlayer.id, file);
                              }
                            }}
                            className="block w-full text-sm text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-600 file:text-white
                              hover:file:bg-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600"
                    onClick={() => setEditingPlayer({ id: player.id, name: player.name, icon: player.icon })}
                  >
                    <div className="flex flex-col">
                      <div>{player.name}</div>
                      {player.inventory && player.inventory.length > 0 && (
                        <div className="text-sm text-gray-400 mt-1">
                          Inventory: {player.inventory.map(item => `${item.name} (${item.count || 1})`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePlayer(player.id, { score: player.score - 1 })}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  -
                </button>
                <span className="text-white min-w-[3ch] text-center">
                  {player.score} {pointsName}
                </span>
                <button
                  onClick={() => updatePlayer(player.id, { score: player.score + 1 })}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  +
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePlayer(player.id, { 
                      inventory: [...(player.inventory || []), ...inventoryItems.map(item => ({ ...item, count: item.count || 1 }))]
                    })}
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    title="Give default inventory items"
                  >
                    +Items
                  </button>
                  <button
                    onClick={() => updatePlayer(player.id, { inventory: [] })}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    title="Clear inventory"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
