import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { Round } from '@/app/types/game';

const ROUNDS_FILE = path.join(process.cwd(), 'data', 'rounds.json');

async function initRoundsFile() {
  try {
    await fs.access(path.dirname(ROUNDS_FILE));
  } catch {
    await fs.mkdir(path.dirname(ROUNDS_FILE), { recursive: true });
  }

  try {
    await fs.access(ROUNDS_FILE);
  } catch {
    await fs.writeFile(ROUNDS_FILE, JSON.stringify([]));
  }
}

export async function GET() {
  await initRoundsFile();
  const rounds = JSON.parse(await fs.readFile(ROUNDS_FILE, 'utf-8')) as Round[];
  return NextResponse.json(rounds.sort((a, b) => a.order - b.order));
}

export async function POST(request: Request) {
  await initRoundsFile();
  const rounds = JSON.parse(await fs.readFile(ROUNDS_FILE, 'utf-8')) as Round[];
  
  const data = await request.json();
  const round: Round = {
    ...data,
    id: Date.now().toString(),
    order: rounds.length,
    questionPoolId: data.questionPoolId || '',
    activeQuestions: [],
    pointsPerQuestion: data.pointsPerQuestion || 100
  };

  rounds.push(round);
  await fs.writeFile(ROUNDS_FILE, JSON.stringify(rounds, null, 2));
  
  return NextResponse.json(round);
}

// The PATCH method is no longer needed as we use PUT /api/rounds/[id] instead

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Round ID required' }, { status: 400 });
  }

  const rounds = JSON.parse(await fs.readFile(ROUNDS_FILE, 'utf-8')) as Round[];
  const filteredRounds = rounds.filter(r => r.id !== id)
    .map((r, index) => ({ ...r, order: index }));

  await fs.writeFile(ROUNDS_FILE, JSON.stringify(filteredRounds, null, 2));
  
  return NextResponse.json({ success: true });
}
