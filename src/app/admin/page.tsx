'use client';

import { useState, useEffect } from 'react';
import { QuestionManager } from '../components/admin/QuestionManager';
import { PlayerManager } from '../components/admin/PlayerManager';
import { RoundManager } from '../components/admin/RoundManager';
import { UserManager } from '../components/admin/UserManager';
import { LoginForm } from '../components/admin/LoginForm';
import PoolManager from '../components/admin/PoolManager';
import { InventoryManager } from '../components/admin/InventoryManager';
import { AuthResponse } from '../types/auth';

type TabType = 'rounds' | 'pools' | 'questions' | 'players' | 'users' | 'inventory';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('rounds');
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!auth) {
    return <LoginForm />;
  }

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Game Admin Panel</h1>
            <span className="text-gray-400">
              Logged in as {auth.username}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-800">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rounds')}
              className={`pb-4 px-1 ${
                activeTab === 'rounds'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Rounds
            </button>
            <button
              onClick={() => setActiveTab('pools')}
              className={`pb-4 px-1 ${
                activeTab === 'pools'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Question Pools
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-4 px-1 ${
                activeTab === 'questions'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`pb-4 px-1 ${
                activeTab === 'players'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Players
            </button>
            {auth.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`pb-4 px-1 ${
                    activeTab === 'users'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Users
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-4 px-1 ${
                activeTab === 'inventory'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Inventory
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="h-[calc(100vh-16rem)] overflow-y-auto">
          {activeTab === 'rounds' && <RoundManager />}
          {activeTab === 'pools' && <PoolManager />}
          {activeTab === 'questions' && <QuestionManager />}
          {activeTab === 'players' && <PlayerManager />}
          {activeTab === 'users' && auth.role === 'admin' && <UserManager currentUser={auth} />}
          {activeTab === 'inventory' && <InventoryManager />}
        </div>
      </div>
    </main>
  );
}
