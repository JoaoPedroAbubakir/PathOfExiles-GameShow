'use client';

import { useState, useEffect } from 'react';
import { Round, QuestionPool } from '@/app/types/game';
import Image from 'next/image';

export const RoundManager = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [pools, setPools] = useState<QuestionPool[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [newRound, setNewRound] = useState<Omit<Round, 'id' | 'order' | 'activeQuestions'>>({
    name: '',
    tileCount: 16,
    backgroundImage: '',
    questionPoolId: '',
    pointsPerQuestion: 1
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadRounds();
    loadPools();
  }, []);

  useEffect(() => {
    if (rounds.length > 0 && !selectedRoundId) {
      setSelectedRoundId(rounds[0].id);
    } else if (rounds.length === 0) {
      setSelectedRoundId('');
    }
  }, [rounds, selectedRoundId]);

  const loadPools = async () => {
    try {
      const response = await fetch('/api/pools');
      if (response.ok) {
        const data = await response.json();
        setPools(data);
      }
    } catch (error) {
      console.error('Error loading pools:', error);
    }
  };

  const loadRounds = async () => {
    try {
      const response = await fetch('/api/rounds');
      if (response.ok) {
        const data = await response.json();
        setRounds(data);
      }
    } catch (error) {
      console.error('Error loading rounds:', error);
    }
  };

  // Assign unique questions from a pool for a round
  const assignQuestionsFromPool = async (roundId: string, poolId: string, count: number) => {
    try {
      const response = await fetch(`/api/rounds/${roundId}/assign-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, count })
      });

      if (response.ok) {
        loadRounds();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to assign questions');
      }
    } catch (error) {
      console.error('Error assigning questions:', error);
      alert('Error assigning questions. Check console for details.');
    }
  };

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
        setNewRound(prev => ({ ...prev, backgroundImage: data.url }));
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdateRound = async (roundId: string, updates: Partial<Round>) => {
    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        loadRounds();
      }
    } catch (error) {
      console.error('Error updating round:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRound)
      });

      if (response.ok) {
        await loadRounds();
        setNewRound({
          name: '',
          tileCount: 16,
          backgroundImage: '',
          questionPoolId: '',
          pointsPerQuestion: 1
        });
        alert('Round added successfully!');
      } else {
        alert('Failed to add round');
      }
    } catch (error) {
      console.error('Error adding round:', error);
      alert('Failed to add round');
    }
  };

  const handleDelete = async (roundId: string) => {
    try {
      const response = await fetch(`/api/rounds?id=${roundId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadRounds();
      } else {
        alert('Failed to delete round');
      }
    } catch (error) {
      console.error('Error deleting round:', error);
      alert('Failed to delete round');
    }
  };



  const moveRound = async (roundId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/rounds/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roundId, direction })
      });

      if (response.ok) {
        await loadRounds();
      }
    } catch (error) {
      console.error('Error moving round:', error);
      alert('Failed to move round');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Round Management</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Round Name
          </label>
          <input
            type="text"
            value={newRound.name}
            onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Points Per Question
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={newRound.pointsPerQuestion}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              const limitedValue = Math.min(Math.max(value, 0), 10);
              setNewRound({ ...newRound, pointsPerQuestion: limitedValue });
            }}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Number of Tiles
          </label>
          <input
            type="number"
            min="4"
            max="36"
            value={newRound.tileCount}
            onChange={(e) => setNewRound({ ...newRound, tileCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Background Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                   file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {uploading && <p className="text-sm text-gray-400 mt-2">Uploading...</p>}
          {newRound.backgroundImage && (
            <div className="mt-2">
              <p className="text-sm text-gray-400">Selected image:</p>
              <div className="relative w-full h-40">
                <Image
                  src={newRound.backgroundImage}
                  alt="Background"
                  className="rounded object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Round
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Existing Rounds</h3>
        <div className="flex items-center gap-4">
          <select
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
            value={selectedRoundId}
            onChange={(e) => setSelectedRoundId(e.target.value)}
          >
            <option value="">Select a round...</option>
            {rounds.map(round => (
              <option key={round.id} value={round.id}>
                {round.name} ({round.activeQuestions?.length || 0}/{round.tileCount} questions)
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveRound(selectedRoundId, 'up')}
              disabled={!selectedRoundId || rounds.findIndex(r => r.id === selectedRoundId) === 0}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              ↑
            </button>
            <button
              onClick={() => moveRound(selectedRoundId, 'down')}
              disabled={!selectedRoundId || rounds.findIndex(r => r.id === selectedRoundId) === rounds.length - 1}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              ↓
            </button>
            <button
              onClick={() => handleDelete(selectedRoundId)}
              disabled={!selectedRoundId}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>

        {selectedRoundId && rounds.map(round => round.id === selectedRoundId && (
          <div key={round.id} className="p-4 bg-gray-800 rounded space-y-4">
            <div className="space-y-2">
              <p className="text-gray-400">Tiles: {round.tileCount}</p>
              {round.backgroundImage && (
                <div className="relative w-full h-32">
                  <Image
                    src={round.backgroundImage}
                    alt={`Background for ${round.name}`}
                    className="rounded object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-white font-medium">Questions ({round.activeQuestions?.length || 0}/{round.tileCount})</h5>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-white mb-2">Question Pool</label>
                    <select
                      className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
                      value={round.questionPoolId}
                      onChange={(e) => handleUpdateRound(round.id, { questionPoolId: e.target.value })}
                    >
                      <option value="">Select a pool...</option>
                      {pools.map(pool => (
                        <option key={pool.id} value={pool.id}>
                          {pool.name} ({pool.questions?.length || 0} questions)
                        </option>
                      ))}
                    </select>
                  </div>

                  {round.activeQuestions?.length > 0 && (
                    <div className="space-y-2">
                      {round.activeQuestions.map((question, qIndex) => (
                        <div key={question.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                          <span className="text-white">Tile {qIndex + 1}: {question.text}</span>
                          <span className="text-green-400 mx-2">{question.answer}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => assignQuestionsFromPool(round.id, round.questionPoolId, round.tileCount)}
                      disabled={!round.questionPoolId}
                    >
                      Randomly Assign Questions from Pool
                    </button>
                    {round.activeQuestions?.length > 0 && (
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => handleUpdateRound(round.id, { activeQuestions: [] })}
                      >
                        Clear Questions
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
