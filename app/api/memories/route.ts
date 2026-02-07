import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const MEMORIES_BLOB_KEY = 'memories-data.json';

// GET - Fetch all memories
export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    // If no token, return empty (graceful degradation)
    if (!token) {
      return NextResponse.json({ memories: Array(5).fill('') });
    }

    try {
      // List blobs to find our memories file
      const { blobs } = await list({ 
        prefix: MEMORIES_BLOB_KEY,
        token: token 
      });
      
      const memoriesBlob = blobs.find(blob => blob.pathname === MEMORIES_BLOB_KEY);
      
      if (!memoriesBlob) {
        return NextResponse.json({ memories: Array(5).fill('') });
      }

      // Fetch the blob content via its URL
      const response = await fetch(memoriesBlob.url);
      if (!response.ok) {
        return NextResponse.json({ memories: Array(5).fill('') });
      }
      
      const text = await response.text();
      const data = JSON.parse(text);
      return NextResponse.json({ memories: data.memories || Array(5).fill('') });
    } catch (error) {
      // If blob doesn't exist or any error, return empty array (graceful degradation)
      console.error('Error reading memories from blob:', error);
      return NextResponse.json({ memories: Array(5).fill('') });
    }
  } catch (error) {
    console.error('Error in GET /api/memories:', error);
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
    
    // Get token
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Blob storage not configured', 
          message: 'BLOB_READ_WRITE_TOKEN is missing.' 
        },
        { status: 500 }
      );
    }
    
    // Save to Vercel Blob Storage
    await put(MEMORIES_BLOB_KEY, jsonString, {
      access: 'public',
      contentType: 'application/json',
      token: token, // Explicitly pass the token
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
