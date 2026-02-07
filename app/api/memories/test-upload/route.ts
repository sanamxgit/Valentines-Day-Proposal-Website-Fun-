import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Test endpoint to diagnose blob upload issues
export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not set',
        message: 'Please set up Vercel Blob Storage in your project settings.'
      });
    }

    // Try to upload a small test file
    const testContent = 'This is a test file';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    
    const result = await put('test-file.txt', testBlob, {
      access: 'public',
      contentType: 'text/plain',
      token: token,
    });

    return NextResponse.json({
      success: true,
      message: 'Blob upload test successful!',
      url: result.url,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10) + '...'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.constructor.name : 'Unknown';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorType: errorName,
      tokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
      message: 'Blob upload test failed. Check the error details above.'
    }, { status: 500 });
  }
}
