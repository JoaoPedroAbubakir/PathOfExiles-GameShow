'use client';

import React, { useState, useEffect } from 'react';
import { InventoryManager } from '@/app/components/admin/InventoryManager';
import { InventoryItem } from '@/app/types/player';
import Image from 'next/image';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemsUpdate = async (updatedItems: InventoryItem[]) => {
    try {
      setLoading(true);
      
      // Get the current items to find what changed
      const currentItems = await fetch('/api/inventory').then(res => res.json());
      
      // Handle deletions
      for (const item of currentItems) {
        if (!updatedItems.find(i => i.id === item.id)) {
          await fetch(`/api/inventory?id=${item.id}`, { method: 'DELETE' });
        }
      }
      
      // Handle additions and updates
      for (const item of updatedItems) {
        const existing = currentItems.find((i: InventoryItem) => i.id === item.id);
        if (!existing) {
          await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } else if (JSON.stringify(existing) !== JSON.stringify(item)) {
          await fetch(`/api/inventory?id=${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        }
      }
      
      await fetchItems();
    } catch (error) {
      console.error('Error updating inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <a href="/admin" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            Back to Admin
          </a>
        </div>
        
        {loading ? (
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-400">Loading inventory items...</p>
          </div>
        ) : (
          <div className="bg-gray-900 p-6 rounded-lg">
            <InventoryManager />
            
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-gray-800 p-4 rounded flex items-center gap-3">
                    <Image
                      src={item.icon}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded"
                    />
                    <div>
                      <div className="text-yellow-400">Value: {item.value}</div>
                      <div className="text-gray-400 text-sm">Count: {item.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
