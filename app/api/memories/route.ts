import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MEMORIES_FILE = path.join(process.cwd(), 'data', 'memories.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// GET - Fetch all memories
export async function GET() {
  try {
    await ensureDataDir();
    
    if (!existsSync(MEMORIES_FILE)) {
      return NextResponse.json({ memories: Array(5).fill('') });
    }

    const fileContent = await readFile(MEMORIES_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ memories: data.memories || Array(5).fill('') });
  } catch (error) {
    console.error('Error reading memories:', error);
    return NextResponse.json({ memories: Array(5).fill('') });
  }
}

// POST - Save memories
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const body = await request.json();
    const { memories } = body;

    if (!Array.isArray(memories)) {
      return NextResponse.json(
        { error: 'Invalid memories data' },
        { status: 400 }
      );
    }

    const data = { memories };
    await writeFile(MEMORIES_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, memories });
  } catch (error) {
    console.error('Error saving memories:', error);
    return NextResponse.json(
      { error: 'Failed to save memories' },
      { status: 500 }
    );
  }
}
