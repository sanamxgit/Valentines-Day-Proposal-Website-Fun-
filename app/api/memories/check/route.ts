import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  return NextResponse.json({
    blobConfigured: !!token,
    tokenLength: token ? token.length : 0,
    message: token 
      ? 'Blob storage is configured ✅' 
      : 'Blob storage is NOT configured. Please set up Vercel Blob Storage in your project settings.'
  });
}
