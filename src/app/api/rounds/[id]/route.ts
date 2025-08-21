import path from 'path';
import { promises as fs } from 'fs';
import { Round } from '@/app/types/game';
import { NextRequest, NextResponse } from "next/server";

const ROUNDS_FILE = path.join(process.cwd(), 'data', 'rounds.json');

// PUT /api/rounds/[id]/route.ts
type Params = { id: string };

export async function PUT(
    request: NextRequest,
    context: { params: Promise<Params> }
) {
    const { id: roundId } = await context.params; // <- await it
    const updates = await request.json();

    const rounds = JSON.parse(await fs.readFile(ROUNDS_FILE, "utf-8")) as Round[];
    const roundIndex = rounds.findIndex((r) => r.id === roundId);

    if (roundIndex === -1) {
        return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    rounds[roundIndex] = {
        ...rounds[roundIndex],
        ...updates,
    };

    await fs.writeFile(ROUNDS_FILE, JSON.stringify(rounds, null, 2));
    return NextResponse.json(rounds[roundIndex]);
}
