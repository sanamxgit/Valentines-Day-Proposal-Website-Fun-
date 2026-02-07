import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const index = formData.get('index') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `memory-${timestamp}-${index}-${originalName}`;

    // Upload to Vercel Blob Storage
    // The token is automatically read from BLOB_READ_WRITE_TOKEN environment variable
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      filename: filename 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for specific error types
    if (errorMessage.includes('BLOB_READ_WRITE_TOKEN') || errorMessage.includes('token')) {
      return NextResponse.json(
        { 
          error: 'Blob storage not configured', 
          message: 'Please set up Vercel Blob Storage in your Vercel project settings. Go to your project → Storage → Create Database → Select Blob. See VERCEL_SETUP.md for detailed instructions.' 
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
        error: 'Failed to upload file', 
        details: errorMessage,
        message: 'Please check the server logs for more details. Make sure Vercel Blob Storage is set up in your project settings.'
      },
      { status: 500 }
    );
  }
}
