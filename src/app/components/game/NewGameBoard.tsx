'use client';

import React, { useState, useEffect } from 'react';
import { Scoreboard } from '../ScoreboardNew';
import { Round, Settings, Question } from '@/app/types/game';
import { QuestionDisplay } from '../QuestionDisplay';
import { ImageModal } from '../ImageModal';
import Image from 'next/image';

export const NewGameBoard = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [settings, setSettings] = useState<Settings>({} as Settings);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const currentRound = rounds[currentRoundIndex];

  const calculateGridDimensions = (questionCount: number) => {
    if (questionCount <= 0) return { cols: 5, rows: 4 }; // Default grid
    
    // Try to make the grid as square as possible
    const sqrt = Math.sqrt(questionCount);
    let cols = Math.ceil(sqrt);
    let rows = Math.ceil(questionCount / cols);
    
    // If the grid is too tall, make it wider
    if (rows > cols + 1) {
      cols = Math.ceil(questionCount / cols);
      rows = Math.ceil(questionCount / cols);
    }
    
    return { cols, rows };
  };

  useEffect(() => {
    // Check if all tiles are revealed for the current round
    if (currentRound?.activeQuestions && revealedTiles.length === currentRound.activeQuestions.length) {
      setShowImageModal(true);
    }
  }, [currentRound?.activeQuestions, revealedTiles]);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const [settingsRes, roundsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/rounds')
        ]);

        const [settingsData, roundsData] = await Promise.all([
          settingsRes.json(),
          roundsRes.json()
        ]);

        setSettings(settingsData);
        setRounds(roundsData);

        if (settingsData.currentRound) {
          const index = roundsData.findIndex((r: Round) => r.id === settingsData.currentRound);
          if (index !== -1) {
            setCurrentRoundIndex(index);
          }
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };

    loadGameData();
  }, []);

  const handleNextRound = async () => {
    if (currentRoundIndex >= rounds.length - 1) return;

    const nextRound = rounds[currentRoundIndex + 1];
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          currentRound: nextRound.id
        })
      });

      if (response.ok) {
        setCurrentRoundIndex(prev => prev + 1);
        setRevealedTiles([]);
        setShowImageModal(false);
      }
    } catch (error) {
      console.error('Error changing round:', error);
    }
  };

  const handleTileClick = (tileNumber: number) => {
    const currentRound = rounds[currentRoundIndex];
    if (!currentRound?.activeQuestions) return;
    
    const question = currentRound.activeQuestions.find(q => q.tileNumber === tileNumber);
    if (question && !revealedTiles.includes(tileNumber)) {
      setCurrentQuestion(question);
    }
  };

  const handleAnswer = (submittedAnswer: string | null) => {
    if (!currentQuestion?.answer) return;

    if (submittedAnswer === null) {
      setCurrentQuestion(null);
      return;
    }

    const normalizedSubmitted = submittedAnswer.toLowerCase().trim();
    const normalizedAnswer = currentQuestion.answer.toLowerCase().trim();

    if (normalizedSubmitted === normalizedAnswer) {
      if (currentQuestion.tileNumber) {
        const newRevealedTiles = [...revealedTiles, currentQuestion.tileNumber!];
        setRevealedTiles(newRevealedTiles);
        
        // Check if all tiles are revealed
        if (currentRound?.activeQuestions && newRevealedTiles.length === currentRound.activeQuestions.length) {
          setShowImageModal(true);
        }
      }
    }
    setCurrentQuestion(null);
  };

  const questionCount = currentRound?.activeQuestions?.length || 0;
  const { cols, rows } = calculateGridDimensions(questionCount);

  return (
    <div className="min-h-screen bg-[#051e34] p-4">
      <div className="max-w-[1920px] h-[1080px] mx-auto flex flex-col gap-4">
        {showImageModal && currentRound?.backgroundImage && (
          <ImageModal
            imageUrl={currentRound.backgroundImage}
            onClose={() => {
              setShowImageModal(false);
              // This ensures that if the user closes the modal, we don't immediately reopen it
              if (currentRound?.activeQuestions && revealedTiles.length === currentRound.activeQuestions.length) {
                setRevealedTiles([]);
              }
            }}
          />
        )}

        <div className="flex items-center justify-between px-4 h-16">
          <h2 className="text-white text-3xl font-[DM_Serif_Display]">{currentRound?.name || 'Loading...'}</h2>
          <div className="text-yellow-400 font-[DM_Serif_Display] text-2xl">
            Points for the round: {currentRound?.pointsPerQuestion || 100}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-4 flex-1">
          <div className="relative bg-[#092847] rounded-lg overflow-hidden shadow-lg">
            <div className="w-full h-full">
              <div className="relative w-full h-full">
                {currentRound?.backgroundImage && (
                  <Image
                    src={currentRound.backgroundImage}
                    alt="Round Background"
                    fill
                    className="object-cover opacity-20"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    priority
                  />
                )}
                
                <div className="absolute inset-0 bg-[#092847]/60" />
                
                <div 
                  className="absolute inset-0 grid gap-[2px] p-[2px]"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                  }}
                >
                  {currentRound?.activeQuestions?.map((question, index) => {
                    const tileNumber = question.tileNumber || index + 1;
                    return (
                      <div 
                        key={tileNumber}
                        className="relative cursor-pointer"
                        onClick={() => handleTileClick(tileNumber)}
                      >
                        <div className={`absolute inset-0 ${
                          revealedTiles.includes(tileNumber) 
                            ? 'bg-transparent backdrop-blur-none opacity-0'
                            : 'bg-[#0d3d6b]/90 backdrop-blur-sm'
                        } rounded transition-all duration-700 flex items-center justify-center`}>
                          {!revealedTiles.includes(tileNumber) && (
                            <>
                              <span className="text-white font-[DM_Serif_Display] opacity-40 text-4xl">
                                {tileNumber}
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-b from-[#0d3d6b]/30 to-[#0d3d6b]/90 rounded hover:opacity-80 transition-opacity" />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Scoreboard isLeftTeam={true} />
            <Scoreboard isLeftTeam={null} />
            <Scoreboard isLeftTeam={false} />
            <div className="mt-auto flex flex-col gap-2">
              <button
                className="w-full px-3 py-2 bg-[#0d4477] text-white rounded hover:bg-[#0e4f8c] font-[DM_Serif_Display] disabled:opacity-50 text-lg shadow-md"
                onClick={() => {
                  if (currentRoundIndex > 0) {
                    const prevRound = rounds[currentRoundIndex - 1];
                    fetch('/api/settings', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...settings,
                        currentRound: prevRound.id
                      })
                    }).then(response => {
                      if (response.ok) {
                        setCurrentRoundIndex(prev => prev - 1);
                        setRevealedTiles([]);
                      }
                    });
                  }
                }}
                disabled={currentRoundIndex <= 0}
              >
                Previous Round
              </button>
              <button
                className="w-full px-3 py-2 bg-[#0d4477] text-white rounded hover:bg-[#0e4f8c] font-[DM_Serif_Display] disabled:opacity-50 text-lg shadow-md"
                onClick={handleNextRound}
                disabled={currentRoundIndex >= rounds.length - 1}
              >
                Next Round
              </button>
            </div>
          </div>
        </div>

        {currentQuestion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <QuestionDisplay 
              question={currentQuestion} 
              onAnswer={handleAnswer}
              points={currentRound?.pointsPerQuestion || 100}
            />
          </div>
        )}
      </div>
    </div>
  );
};
