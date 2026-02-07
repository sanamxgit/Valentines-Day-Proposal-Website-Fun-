import { NextRequest, NextResponse } from 'next/server';
import { put, head } from '@vercel/blob';

const MEMORIES_BLOB_KEY = 'memories-data.json';

// GET - Fetch all memories
export async function GET() {
  try {
    try {
      // Check if the blob exists and get its URL
      const blob = await head(MEMORIES_BLOB_KEY);
      
      if (!blob) {
        return NextResponse.json({ memories: Array(5).fill('') });
      }

      // Fetch the blob content via its URL
      const response = await fetch(blob.url);
      if (!response.ok) {
        return NextResponse.json({ memories: Array(5).fill('') });
      }
      
      const text = await response.text();
      const data = JSON.parse(text);
      return NextResponse.json({ memories: data.memories || Array(5).fill('') });
    } catch (error) {
      // If blob doesn't exist (BlobNotFoundError), return empty array
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('404') ||
        error.constructor.name === 'BlobNotFoundError'
      )) {
        return NextResponse.json({ memories: Array(5).fill('') });
      }
      // If token is missing, return empty array (graceful degradation)
      if (error instanceof Error && error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        console.warn('Blob storage not configured, returning empty memories');
        return NextResponse.json({ memories: Array(5).fill('') });
      }
      console.error('Error reading memories:', error);
      return NextResponse.json({ memories: Array(5).fill('') });
    }
  } catch (error) {
    console.error('Error reading memories:', error);
    return NextResponse.json({ memories: Array(5).fill('') });
  }
}

// POST - Save memories
export async function POST(request: NextRequest) {
  try {
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
    // The token is automatically read from BLOB_READ_WRITE_TOKEN environment variable
    await put(MEMORIES_BLOB_KEY, jsonString, {
      access: 'public',
      contentType: 'application/json',
    });

    return NextResponse.json({ success: true, memories });
  } catch (error) {
    console.error('Error saving memories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('BLOB_READ_WRITE_TOKEN') || errorMessage.includes('token')) {
      return NextResponse.json(
        { 
          error: 'Blob storage not configured', 
          message: 'Please set up Vercel Blob Storage in your Vercel project settings. Go to your project → Storage → Create Database → Select Blob.' 
        },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Blob storage authentication failed', 
          message: 'Please check your BLOB_READ_WRITE_TOKEN in Vercel project settings.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to save memories', 
        details: errorMessage,
        message: 'Please check the server logs for more details.'
      },
      { status: 500 }
    );
  }
}
