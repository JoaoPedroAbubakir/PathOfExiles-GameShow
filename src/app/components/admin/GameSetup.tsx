'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface GameSettings {
  tileCount: number;
  backgroundImage: string;
}

interface GameSetupProps {
  onSave: (settings: GameSettings) => void;
  currentSettings?: GameSettings;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onSave, currentSettings }) => {
  const [tileCount, setTileCount] = useState(currentSettings?.tileCount || 16);
  const [selectedImage, setSelectedImage] = useState(currentSettings?.backgroundImage || '');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setSelectedImage(data.url);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="bg-gray-900 p-3 rounded-lg">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-shrink-0">
          <label className="block text-xs font-medium text-gray-400">
            Tiles
          </label>
          <input
            type="number"
            min="4"
            max="36"
            value={tileCount}
            onChange={(e) => setTileCount(Math.max(4, Math.min(36, parseInt(e.target.value) || 4)))}
            className="w-20 px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
        </div>

        <div className="flex-grow">
          <label className="block text-xs font-medium text-gray-400">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 
                       file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
            {selectedImage && (
              <div className="relative w-12 h-12">
                <Image 
                  src={selectedImage} 
                  alt="Selected" 
                  className="rounded object-contain" 
                  fill
                  sizes="48px"
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onSave({ tileCount, backgroundImage: selectedImage })}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex-shrink-0"
        >
          Save
        </button>
      </div>
    </div>
  );
};
