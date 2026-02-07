import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Check if token exists
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json(
        { 
          error: 'Blob storage not configured', 
          message: 'BLOB_READ_WRITE_TOKEN environment variable is missing. Please set up Vercel Blob Storage in your Vercel project settings: Go to your project → Storage → Create Database → Select Blob.' 
        },
        { status: 500 }
      );
    }

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

    console.log('Attempting to upload file:', filename, 'Size:', file.size, 'Type:', file.type);
    console.log('Token exists:', !!token, 'Token length:', token?.length);

    // Upload to Vercel Blob Storage
    // Explicitly pass the token to ensure it's used
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      token: token, // Explicitly pass the token
    });

    console.log('Upload successful, URL:', blob.url);

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      filename: filename 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.constructor.name : 'Unknown';
    
    console.error('Error details:', {
      message: errorMessage,
      name: errorName,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check for specific error types
    if (errorName === 'BlobStoreNotFoundError' || errorMessage.includes('store') || errorMessage.includes('Store')) {
      return NextResponse.json(
        { 
          error: 'Blob store not found', 
          message: 'Please make sure you have created a Blob store in your Vercel project. Go to your project → Storage → Create Database → Select Blob and create a store.',
          details: errorMessage
        },
        { status: 500 }
      );
    }

    if (errorName === 'BlobClientTokenExpiredError' || errorMessage.includes('token') || errorMessage.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json(
        { 
          error: 'Blob storage token issue', 
          message: 'Please check your BLOB_READ_WRITE_TOKEN in Vercel project settings. Make sure the Blob store is created and the token is set.',
          details: errorMessage
        },
        { status: 500 }
      );
    }
    
    if (errorName === 'BlobAccessError' || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Blob storage authentication failed', 
          message: 'Please check your BLOB_READ_WRITE_TOKEN in Vercel project settings.',
          details: errorMessage
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: errorMessage,
        errorType: errorName,
        message: 'Please check the Vercel Function Logs in your dashboard for more details. Make sure Vercel Blob Storage is set up in your project settings.'
      },
      { status: 500 }
    );
  }
}
