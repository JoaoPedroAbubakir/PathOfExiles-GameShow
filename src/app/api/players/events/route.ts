import { promises as fs } from 'fs';
import path from 'path';

const playersPath = path.join(process.cwd(), 'data', 'players.json');
const encoder = new TextEncoder();

async function getPlayers() {
  try {
    const content = await fs.readFile(playersPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

let lastModified = 0;

export async function GET() {
  const response = new Response(
    new ReadableStream({
      async start(controller) {
        // Send initial data
        const players = await getPlayers();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(players)}\n\n`));
        
        while (true) {
          try {
            const stats = await fs.stat(playersPath);
            if (stats.mtimeMs > lastModified) {
              lastModified = stats.mtimeMs;
              const players = await getPlayers();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(players)}\n\n`));
            }
          } catch (error) {
            console.error('Error checking for player updates:', error);
          }

          // Wait 100ms before checking again
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    }
  );

  return response;
}
