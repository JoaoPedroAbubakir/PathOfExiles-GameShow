import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { InventoryItem } from '@/app/types/player';

const inventoryPath = path.join(process.cwd(), 'data', 'inventory_items.json');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const itemId = formData.get('itemId') as string;
    
    if (!file || !itemId) {
      return NextResponse.json(
        { error: 'No file or item ID provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }

    // Read file as array buffer and convert to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to uploads directory
    await fs.writeFile(filePath, buffer);

    // Update item's icon in inventory
    const items = JSON.parse(await fs.readFile(inventoryPath, 'utf-8'));
    const updatedItems = items.map((item: InventoryItem) => 
      item.id === itemId ? { ...item, icon: `/uploads/${filename}` } : item
    );
    await fs.writeFile(inventoryPath, JSON.stringify(updatedItems, null, 2));

    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
