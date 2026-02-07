import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const tokenPrefix = token ? token.substring(0, 10) + '...' : 'none';
  
  return NextResponse.json({
    blobConfigured: !!token,
    tokenLength: token ? token.length : 0,
    tokenPrefix: tokenPrefix,
    message: token 
      ? 'Blob storage is configured ✅ - Token is present' 
      : 'Blob storage is NOT configured. Please set up Vercel Blob Storage in your project settings.',
    instructions: !token ? [
      '1. Go to your Vercel project dashboard',
      '2. Click on the "Storage" tab',
      '3. Click "Create Database" or "Connect Database"',
      '4. Select "Blob" from the options',
      '5. Create a new Blob store (you can name it anything)',
      '6. Vercel will automatically add BLOB_READ_WRITE_TOKEN',
      '7. Redeploy your project'
    ] : []
  });
}
