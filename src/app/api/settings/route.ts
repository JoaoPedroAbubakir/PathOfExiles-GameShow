import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

// Initialize settings file if it doesn't exist
async function initSettingsFile() {
  try {
    await fs.access(path.dirname(settingsPath));
  } catch {
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  }
  
  try {
    await fs.access(settingsPath);
  } catch {
    await fs.writeFile(settingsPath, JSON.stringify({
      tileCount: 16,
      backgroundImage: ''
    }));
  }
}

export async function GET() {
  await initSettingsFile();
  const settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  await initSettingsFile();
  const settings = await request.json();
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  await initSettingsFile();
  const updates = await request.json();
  const currentSettings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));
  const newSettings = { ...currentSettings, ...updates };
  await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2));
  return NextResponse.json(newSettings);
}