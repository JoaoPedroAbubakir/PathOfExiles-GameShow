import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { Round } from '@/app/types/game';

const ROUNDS_FILE = path.join(process.cwd(), 'data', 'rounds.json');

// PUT /api/rounds/[id]/route.ts
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const roundId = params.id;
  const updates = await request.json();

  const rounds = JSON.parse(await fs.readFile(ROUNDS_FILE, 'utf-8')) as Round[];
  const roundIndex = rounds.findIndex(r => r.id === roundId);

  if (roundIndex === -1) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 });
  }

  rounds[roundIndex] = {
    ...rounds[roundIndex],
    ...updates
  };

  await fs.writeFile(ROUNDS_FILE, JSON.stringify(rounds, null, 2));
  return NextResponse.json(rounds[roundIndex]);
}
