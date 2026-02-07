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
      // list() returns an empty array if no blobs exist - it doesn't throw an error
      const { blobs } = await list({ 
        limit: 100, // Limit results
        token: token 
      });
      
      // Find the memories blob by exact pathname match
      const memoriesBlob = blobs.find(blob => blob.pathname === MEMORIES_BLOB_KEY);
      
      if (!memoriesBlob) {
        // No memories file exists yet - this is normal, return empty array
        // Don't log anything - this is expected behavior
        return NextResponse.json({ memories: Array(5).fill('') });
      }

      // Fetch the blob content via its URL
      const response = await fetch(memoriesBlob.url);
      if (!response.ok) {
        // If fetch fails, return empty array (don't log - might be transient)
        return NextResponse.json({ memories: Array(5).fill('') });
      }
      
      const text = await response.text();
      const data = JSON.parse(text);
      return NextResponse.json({ memories: data.memories || Array(5).fill('') });
    } catch (error) {
      // Handle any errors gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.constructor.name : 'Unknown';
      
      // Check if this is a "blob does not exist" type error
      // These are expected when no memories exist yet - don't log them
      const isExpectedError = 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('404') ||
        errorMessage.includes('BlobNotFound') ||
        errorMessage.includes('The requested blob') ||
        errorName === 'BlobNotFoundError';
      
      if (isExpectedError) {
        // This is expected when no memories exist yet - silently return empty array
        // Don't log anything to avoid cluttering logs
        return NextResponse.json({ memories: Array(5).fill('') });
      }
      
      // For other unexpected errors, log but still return empty array (graceful degradation)
      // Only log real errors, not expected "not found" scenarios
      console.warn('Unexpected error reading memories from blob:', errorMessage);
      return NextResponse.json({ memories: Array(5).fill('') });
    }
  } catch (error) {
    // Outer catch for any unexpected errors
    // Only log if it's not a "not found" type error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isExpectedError = 
      errorMessage.includes('does not exist') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('The requested blob');
    
    if (!isExpectedError) {
      console.error('Error in GET /api/memories:', error);
    }
    
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
