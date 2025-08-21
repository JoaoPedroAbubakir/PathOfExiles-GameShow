import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions.json');

// Initialize questions file if it doesn't exist
async function initQuestionsFile() {
  try {
    await fs.access(QUESTIONS_FILE);
  } catch {
    await fs.mkdir(path.dirname(QUESTIONS_FILE), { recursive: true });
    await fs.writeFile(QUESTIONS_FILE, '[]');
  }
}

// Get all questions or a specific question by tile number
export async function GET(request: NextRequest) {
  await initQuestionsFile();
  const questions = JSON.parse(await fs.readFile(QUESTIONS_FILE, 'utf-8'));
  
  const { searchParams } = new URL(request.url);
  const roundId = searchParams.get('roundId');
  const tileNumber = searchParams.get('tileNumber');
  
  // If roundId and tileNumber are provided, find the question for that round and tile
  if (roundId && tileNumber !== null) {
    const rounds = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'rounds.json'), 'utf-8'));
    const round = rounds.find((r: { id: string }) => r.id === roundId);
    
    if (!round || !round.questions) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }
    
    // Find the question with the matching tileNumber
    const question = round.questions.find((q: { tileNumber: number }) => 
      q.tileNumber === parseInt(tileNumber) + 1
    );
    
    if (question) {
      return NextResponse.json({
        id: question.id,
        text: question.text,
        answer: question.answer,
        imageUrl: question.imageUrl,
        tileNumber: question.tileNumber
      });
    }
    
    return NextResponse.json(
      { error: 'Question not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(questions);
}

// Create new question
export async function POST(request: NextRequest) {
  try {
    await initQuestionsFile();
    
    const question = await request.json();
    const questions = JSON.parse(await fs.readFile(QUESTIONS_FILE, 'utf-8'));
    
    const newQuestion = {
      ...question,
      id: Date.now().toString(),
    };
    
    questions.push(newQuestion);
    await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
    
    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Error creating question' },
      { status: 500 }
    );
  }
}

// Delete question
export async function DELETE(request: NextRequest) {
  try {
    await initQuestionsFile();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    const questions = JSON.parse(await fs.readFile(QUESTIONS_FILE, 'utf-8'));
    const updatedQuestions = questions.filter(q => q.id !== id);
    
    if (questions.length === updatedQuestions.length) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    await fs.writeFile(QUESTIONS_FILE, JSON.stringify(updatedQuestions, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Error deleting question' },
      { status: 500 }
    );
  }
}
