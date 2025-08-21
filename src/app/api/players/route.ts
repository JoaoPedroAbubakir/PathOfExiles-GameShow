import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Player } from '@/app/types/player';

const playersPath = path.join(process.cwd(), 'data', 'players.json');

// Initialize players file if it doesn't exist
async function initPlayersFile() {
  try {
    await fs.access(path.dirname(playersPath));
  } catch {
    await fs.mkdir(path.dirname(playersPath), { recursive: true });
  }
  
  try {
    await fs.access(playersPath);
  } catch {
    await fs.writeFile(playersPath, JSON.stringify([]));
  }
}

export async function GET() {
  await initPlayersFile();
  const players: Player[] = JSON.parse(await fs.readFile(playersPath, 'utf-8'));
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  await initPlayersFile();
  const players: Player[] = JSON.parse(await fs.readFile(playersPath, 'utf-8'));
  
  if (players.length >= 10) {
    return NextResponse.json(
      { error: 'Maximum number of players reached' },
      { status: 400 }
    );
  }

  const newPlayer = await request.json();
  const player: Player = {
    id: Date.now().toString(),
    name: newPlayer.name,
    score: 0,
    icon: newPlayer.icon || '/vercel.svg',
    inventory: newPlayer.inventory || []
  };

  players.push(player);
  await fs.writeFile(playersPath, JSON.stringify(players, null, 2));
  
  return NextResponse.json(player);
}

export async function PATCH(request: Request) {
  const players: Player[] = JSON.parse(await fs.readFile(playersPath, 'utf-8'));
  const { id, ...updates } = await request.json();
  
  const index = players.findIndex((p: Player) => p.id === id);
  if (index === -1) {
    return NextResponse.json(
      { error: 'Player not found' },
      { status: 404 }
    );
  }

  players[index] = { ...players[index], ...updates };
  await fs.writeFile(playersPath, JSON.stringify(players, null, 2));
  
  return NextResponse.json(players[index]);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Player ID required' },
      { status: 400 }
    );
  }

  const players: Player[] = JSON.parse(await fs.readFile(playersPath, 'utf-8'));
  const filteredPlayers = players.filter((p: Player) => p.id !== id);
  
  await fs.writeFile(playersPath, JSON.stringify(filteredPlayers, null, 2));
  
  return NextResponse.json({ success: true });
}
