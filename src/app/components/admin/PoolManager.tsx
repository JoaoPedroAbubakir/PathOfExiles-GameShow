import { useState, useEffect } from 'react';
import { QuestionPool } from '@/app/types/game';
import Image from 'next/image';

export default function PoolManager() {
  const [pools, setPools] = useState<QuestionPool[]>([]);
  const [newPoolName, setNewPoolName] = useState('');
  const [selectedPool, setSelectedPool] = useState<string>('');

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    const response = await fetch('/api/pools');
    const data = await response.json();
    setPools(data);
  };

  const createPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName.trim()) return;

    const response = await fetch('/api/pools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPoolName })
    });

    if (response.ok) {
      setNewPoolName('');
      fetchPools();
    }
  };

  const importQuestions = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedPool) return;

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('poolId', selectedPool);

    const response = await fetch(`/api/pools`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      fetchPools();
    }
  };

  const deletePool = async (poolId: string) => {
    if (!confirm('Are you sure you want to delete this pool? This action cannot be undone.')) return;

    const response = await fetch(`/api/pools?id=${poolId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      if (selectedPool === poolId) {
        setSelectedPool('');
      }
      fetchPools();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Question Pools</h2>
      
      {/* Create new pool */}
      <form onSubmit={createPool} className="space-y-2">
        <input
          type="text"
          value={newPoolName}
          onChange={(e) => setNewPoolName(e.target.value)}
          placeholder="New pool name"
          className="bg-gray-800 text-white border border-gray-700 p-2 rounded placeholder-gray-400"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Create Pool
        </button>
      </form>

      {/* Pool list and import */}
      {pools.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 p-2 rounded w-full"
            >
              <option value="">Select a pool...</option>
              {pools.map(pool => (
                <option key={pool.id} value={pool.id}>
                  {pool.name} ({pool.questions?.length || 0} questions)
                </option>
              ))}
            </select>
            {selectedPool && (
              <button 
                onClick={() => deletePool(selectedPool)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                title="Delete pool"
              >
                Delete
              </button>
            )}
          </div>

          {selectedPool && (
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={importQuestions}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a CSV file with columns: text, answer, imageUrl (optional)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Display questions in selected pool */}
      {selectedPool && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Questions in Pool</h3>
          <div className="space-y-2">
            {pools.find(p => p.id === selectedPool)?.questions.map(question => (
              <div key={question.id} className="border p-2 rounded">
                <p><strong>Q:</strong> {question.text}</p>
                <p><strong>A:</strong> {question.answer}</p>
                {question.imageUrl && (
                  <div className="relative mt-2 h-32 w-48">
                    <Image 
                      src={question.imageUrl} 
                      alt="Question hint" 
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
