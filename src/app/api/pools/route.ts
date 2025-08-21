import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { QuestionPool } from '@/app/types/game';

const dataDir = path.join(process.cwd(), 'data');
const poolsFile = path.join(dataDir, 'pools.json');

// Initialize pools.json if it doesn't exist
async function initPoolsFile() {
  try {
    await fs.access(poolsFile);
  } catch {
    await fs.writeFile(poolsFile, JSON.stringify([]));
  }
}

// GET /api/pools - List all question pools
export async function GET() {
  await initPoolsFile();
  const poolsData = await fs.readFile(poolsFile, 'utf-8');
  const pools: QuestionPool[] = JSON.parse(poolsData);
  return NextResponse.json(pools);
}

// POST /api/pools - Create a new pool
export async function POST(request: NextRequest) {
  const data = await request.json();
  const pools: QuestionPool[] = JSON.parse(await fs.readFile(poolsFile, 'utf-8'));
  
  const newPool: QuestionPool = {
    id: Date.now().toString(),
    name: data.name,
    questions: []
  };
  
  pools.push(newPool);
  await fs.writeFile(poolsFile, JSON.stringify(pools, null, 2));
  return NextResponse.json(newPool);
}

// PUT /api/pools/:id - Import questions to a pool from CSV
export async function PUT(request: NextRequest) {
  const formData = await request.formData();
  const poolId = formData.get('poolId') as string;
  const file = formData.get('file') as File;
  
  if (!file || !poolId) {
    return NextResponse.json({ error: 'Missing poolId or file' }, { status: 400 });
  }

  const fileContent = await file.text();
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const pools: QuestionPool[] = JSON.parse(await fs.readFile(poolsFile, 'utf-8'));
  const poolIndex = pools.findIndex(p => p.id === poolId);
  
  if (poolIndex === -1) {
    return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
  }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newQuestions = records.map((record: any) => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    text: record.text,
    answer: record.answer,
    imageUrl: record.imageUrl || undefined,
    poolId
  }));

  pools[poolIndex].questions.push(...newQuestions);
  await fs.writeFile(poolsFile, JSON.stringify(pools, null, 2));

  return NextResponse.json(newQuestions);
}

// DELETE /api/pools - Delete a pool
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get('id');

  if (!poolId) {
    return NextResponse.json({ error: 'Missing poolId' }, { status: 400 });
  }

  const pools: QuestionPool[] = JSON.parse(await fs.readFile(poolsFile, 'utf-8'));
  const poolIndex = pools.findIndex(p => p.id === poolId);
  
  if (poolIndex === -1) {
    return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
  }

  pools.splice(poolIndex, 1);
  await fs.writeFile(poolsFile, JSON.stringify(pools, null, 2));

  return NextResponse.json({ success: true });
}
