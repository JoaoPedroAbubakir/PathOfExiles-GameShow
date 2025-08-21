import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { InventoryItem } from '@/app/types/player';

const itemsPath = path.join(process.cwd(), 'data', 'inventory_items.json');

// Initialize items file if it doesn't exist
async function initItemsFile() {
  try {
    await fs.access(path.dirname(itemsPath));
  } catch {
    await fs.mkdir(path.dirname(itemsPath), { recursive: true });
  }
  
  try {
    await fs.access(itemsPath);
  } catch {
    await fs.writeFile(itemsPath, JSON.stringify([]));
  }
}

export async function GET() {
  await initItemsFile();
  const items: InventoryItem[] = JSON.parse(await fs.readFile(itemsPath, 'utf-8'));
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  await initItemsFile();
  const items: InventoryItem[] = JSON.parse(await fs.readFile(itemsPath, 'utf-8'));
  const newItem = await request.json();
  
  const item: InventoryItem = {
    id: Date.now().toString(),
    icon: newItem.icon,
    value: newItem.value,
    count: newItem.count || 0
  };

  items.push(item);
  await fs.writeFile(itemsPath, JSON.stringify(items, null, 2));
  
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Item ID required' },
      { status: 400 }
    );
  }

  const items: InventoryItem[] = JSON.parse(await fs.readFile(itemsPath, 'utf-8'));
  const filteredItems = items.filter(item => item.id !== id);
  
  await fs.writeFile(itemsPath, JSON.stringify(filteredItems, null, 2));
  
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Item ID required' },
      { status: 400 }
    );
  }

  const items: InventoryItem[] = JSON.parse(await fs.readFile(itemsPath, 'utf-8'));
  const updates = await request.json();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    );
  }

  items[index] = { ...items[index], ...updates };
  await fs.writeFile(itemsPath, JSON.stringify(items, null, 2));
  
  return NextResponse.json(items[index]);
}
