'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem } from '@/app/types/player';
import Image from 'next/image';
import { IconSelector } from './IconSelector';

export const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    description: '',
    icon: '/vercel.svg',
    count: 1
  });
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, itemId?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('itemId', itemId || 'new');
      
      const response = await fetch('/api/inventory/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (itemId) {
          await fetchItems(); // Refresh the items list
        } else {
          setNewItem(prev => ({ ...prev, icon: data.url }));
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image');
    }
  };

  const addItem = async () => {
    if (!newItem.name) return;

    try {
      const item: InventoryItem = {
        id: Date.now().toString(),
        ...newItem
      };

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...items, item])
      });

      if (response.ok) {
        await fetchItems();
        setNewItem({
          name: '',
          description: '',
          icon: '/vercel.svg',
          count: 1
        });
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      });

      if (response.ok) {
        await fetchItems();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchItems();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Inventory Items</h2>
      
      {/* Add new item form */}
      <div className="grid grid-cols-2 gap-4 bg-gray-800 p-4 rounded">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
          <input
            type="text"
            value={newItem.name}
            onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
          <input
            type="text"
            value={newItem.description}
            onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Count</label>
          <input
            type="number"
            value={newItem.count}
            onChange={e => setNewItem(prev => ({ ...prev, count: Number(e.target.value) || 0 }))}
            min="0"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
          <div className="flex gap-4 items-center">
            <Image
              src={newItem.icon}
              alt=""
              width={40}
              height={40}
              className="bg-gray-700 rounded p-1"
            />
            <div className="flex-1">
              <IconSelector
                selectedIcon={newItem.icon}
                onSelect={icon => setNewItem(prev => ({ ...prev, icon }))}
              />
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e)}
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
        
        <button
          onClick={addItem}
          className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded">
            {editingItem === item.id ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateItem(item.id, { name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, { description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Count</label>
                  <input
                    type="number"
                    value={item.count}
                    onChange={e => updateItem(item.id, { count: Number(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
                  <div className="flex gap-4 items-center">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="bg-gray-700 rounded p-1"
                    />
                    <div className="flex-1">
                      <IconSelector
                        selectedIcon={item.icon}
                        onSelect={icon => updateItem(item.id, { icon })}
                      />
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e, item.id)}
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
                
                <button
                  onClick={() => setEditingItem(null)}
                  className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="bg-gray-700 rounded p-1 mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{item.name}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                  <p className="text-gray-400 text-sm">Count: {item.count}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingItem(item.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
