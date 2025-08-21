import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  onAnswer: (answer: string | null) => void;
  points: number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, onAnswer, points }) => {
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft === 0) {
      onAnswer(null); // Time's up, no answer provided
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswer(answer.trim());
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto max-w-4xl">
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-white">Question</div>
            <div className="text-lg text-yellow-400">Worth: {points} points</div>
          </div>
          <div className={`text-2xl font-mono ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
            {timeLeft}s
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          <h3 className="text-xl font-semibold text-white">{question.text}</h3>
          
          {question.imageUrl && (
            <div className="relative w-full max-h-[50vh] flex justify-center items-center overflow-hidden bg-black rounded-lg">
              <Image
                src={question.imageUrl}
                alt="Question Image"
                className="max-w-full max-h-full object-contain"
                width={800}
                height={600}
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2 sticky bottom-0">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-1 p-3 rounded bg-gray-700 text-white text-lg"
              placeholder="Enter your answer..."
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg font-semibold"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
