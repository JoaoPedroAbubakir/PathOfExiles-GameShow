'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/app/types/game';
import Image from 'next/image';

interface QuestionManagerProps {
  roundId?: string;
  onAssignQuestion?: (questionId: string) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ roundId, onAssignQuestion }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    answer: '',
    imageUrl: '',
  });
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, []);

  const exportQuestionsToCSV = () => {
    // Create CSV content
    const headers = ['text', 'answer', 'imageUrl'];
    const rows = questions
      .filter(q => selectedQuestions.size === 0 || selectedQuestions.has(q.id))
      .map(q => [
        // Properly escape fields that might contain commas or quotes
        `"${q.text.replace(/"/g, '""')}"`,
        `"${q.answer.replace(/"/g, '""')}"`,
        q.imageUrl ? `"${q.imageUrl.replace(/"/g, '""')}"` : ''
      ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'questions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions?id=${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId));
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });

      if (!response.ok) throw new Error('Failed to create question');

      const savedQuestion = await response.json();
      setQuestions([...questions, savedQuestion]);
      setNewQuestion({ text: '', answer: '', imageUrl: '' });
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Question Management</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Question Text
          </label>
          <input
            type="text"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Answer
          </label>
          <input
            type="text"
            value={newQuestion.answer}
            onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Image Hint (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('image', file);
                  try {
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await response.json();
                    setNewQuestion({ ...newQuestion, imageUrl: data.url });
                  } catch (error) {
                    console.error('Upload error:', error);
                    alert('Failed to upload image');
                  }
                }
              }}
              className="flex-1 text-sm text-gray-400 file:mr-2 file:py-1 file:px-2 
                      file:rounded file:border-0 file:text-xs file:font-medium 
                      file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {newQuestion.imageUrl && (
              <div className="relative w-10 h-10">
                <Image
                  src={newQuestion.imageUrl}
                  alt="Question hint"
                  className="rounded object-cover"
                  fill
                  sizes="40px"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </form>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Existing Questions</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedQuestions.size === questions.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedQuestions(new Set(questions.map(q => q.id)));
                  } else {
                    setSelectedQuestions(new Set());
                  }
                }}
              />
              Select All
            </label>
            <button
              onClick={exportQuestionsToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={questions.length === 0}
            >
              Export Selected to CSV
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="p-4 bg-gray-800 rounded group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(q.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedQuestions);
                      if (e.target.checked) {
                        newSelected.add(q.id);
                      } else {
                        newSelected.delete(q.id);
                      }
                      setSelectedQuestions(newSelected);
                    }}
                    className="mt-1"
                  />
                  <div className="space-y-2">
                    <p className="text-white"><strong>Question:</strong> {q.text}</p>
                    <p className="text-gray-400"><strong>Answer:</strong> {q.answer}</p>
                    {q.imageUrl && (
                      <p className="text-gray-400"><strong>Image:</strong> {q.imageUrl}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {roundId && onAssignQuestion && (
                    <button
                      onClick={() => onAssignQuestion(q.id)}
                      className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Assign
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
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
