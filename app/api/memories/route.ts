import { NextRequest, NextResponse } from 'next/server';
import { get, put } from '@vercel/blob';

const MEMORIES_BLOB_KEY = 'memories-data.json';

// GET - Fetch all memories
export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      // If blob storage not configured, return empty array
      return NextResponse.json({ memories: Array(5).fill('') });
    }

    try {
      const blob = await get(MEMORIES_BLOB_KEY, { token });
      const text = await blob.text();
      const data = JSON.parse(text);
      return NextResponse.json({ memories: data.memories || Array(5).fill('') });
    } catch (error) {
      // If blob doesn't exist, return empty array
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('404'))) {
        return NextResponse.json({ memories: Array(5).fill('') });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error reading memories:', error);
    return NextResponse.json({ memories: Array(5).fill('') });
  }
}

// POST - Save memories
export async function POST(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Blob storage not configured', 
          message: 'Please set up Vercel Blob Storage in your Vercel project settings.' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { memories } = body;

    if (!Array.isArray(memories)) {
      return NextResponse.json(
        { error: 'Invalid memories data' },
        { status: 400 }
      );
    }

    const data = { memories };
    const jsonString = JSON.stringify(data, null, 2);
    
    // Save to Vercel Blob Storage
    await put(MEMORIES_BLOB_KEY, jsonString, {
      access: 'public',
      contentType: 'application/json',
      token: token,
    });

    return NextResponse.json({ success: true, memories });
  } catch (error) {
    console.error('Error saving memories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Blob storage authentication failed', 
          message: 'Please check your BLOB_READ_WRITE_TOKEN in Vercel project settings.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save memories', details: errorMessage },
      { status: 500 }
    );
  }
}
