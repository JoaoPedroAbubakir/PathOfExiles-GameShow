import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { Round } from '@/app/types/game';

const ROUNDS_FILE = path.join(process.cwd(), 'data', 'rounds.json');

export async function PATCH(request: Request) {
  const { roundId, newOrder } = await request.json();
  const rounds = JSON.parse(await fs.readFile(ROUNDS_FILE, 'utf-8')) as Round[];

  const roundIndex = rounds.findIndex(r => r.id === roundId);
  if (roundIndex === -1) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 });
  }

  const round = rounds[roundIndex];
  const oldOrder = round.order;

  // Update orders
  rounds.forEach(r => {
    if (oldOrder < newOrder) {
      // Moving down: decrease order of items between old and new position
      if (r.order > oldOrder && r.order <= newOrder) {
        r.order--;
      }
    } else {
      // Moving up: increase order of items between new and old position
      if (r.order >= newOrder && r.order < oldOrder) {
        r.order++;
      }
    }
  });

  round.order = newOrder;
  await fs.writeFile(ROUNDS_FILE, JSON.stringify(rounds, null, 2));

  return NextResponse.json(round);
}
