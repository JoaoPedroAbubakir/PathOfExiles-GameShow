import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Round, Question } from '@/app/types/game';

const dataDir = path.join(process.cwd(), 'data');
const poolsFile = path.join(dataDir, 'pools.json');
const roundsFile = path.join(dataDir, 'rounds.json');

// Get a random sample of questions, ensuring no duplicates from used questions
async function getRandomQuestions(roundId: string, poolId: string, count: number): Promise<Question[]> {
  // Read all rounds to track used questions
  const rounds: Round[] = JSON.parse(await fs.readFile(roundsFile, 'utf-8'));
  const pools = JSON.parse(await fs.readFile(poolsFile, 'utf-8')) as { id: string; questions: Question[] }[];
  
  // Get the pool
  const pool = pools.find(p => p.id === poolId);
  if (!pool) {
    throw new Error('Pool not found');
  }

  // Get all questions that have been used in any round
  const usedQuestions = new Set<string>();
  rounds.forEach(round => {
    if (round.questionPoolId === poolId) {
      round.activeQuestions?.forEach(q => usedQuestions.add(q.id));
    }
  });

  // Filter out used questions from the pool
  const availableQuestions = pool.questions.filter((q: Question) => !usedQuestions.has(q.id));

  // If we don't have enough available questions, throw an error
  if (availableQuestions.length < count) {
    throw new Error(`Not enough unused questions in pool. Available: ${availableQuestions.length}, Requested: ${count}`);
  }

  // Shuffle and take the requested number of questions
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

type Params = { id: string };
// POST /api/rounds/[id]/assign-questions
export async function POST(
    request: NextRequest,
    context: { params: Promise<Params> } // <- Promise here
) {
    try {
        const { id: roundId } = await context.params; // <- await the params

        const data = await request.json();
        const { poolId, count } = data as { poolId?: string; count?: number };

        if (typeof poolId !== "string" || typeof count !== "number" || count <= 0) {
            return NextResponse.json(
                { error: "Pool ID (string) and count (positive number) are required" },
                { status: 400 }
            );
        }

        // Get random unused questions
        const selectedQuestions = await getRandomQuestions(roundId, poolId, count);

        // Update the round with the new questions
        const rounds: Round[] = JSON.parse(await fs.readFile(roundsFile, "utf-8"));
        const roundIndex = rounds.findIndex((r) => r.id === roundId);

        if (roundIndex === -1) {
            return NextResponse.json({ error: "Round not found" }, { status: 404 });
        }

        // Add tile numbers to the selected questions
        rounds[roundIndex].activeQuestions = selectedQuestions.map((q, index) => ({
            ...q,
            tileNumber: index + 1,
        }));
        rounds[roundIndex].questionPoolId = poolId;

        await fs.writeFile(roundsFile, JSON.stringify(rounds, null, 2));

        return NextResponse.json(selectedQuestions); // NextResponse is compatible with Response
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
}