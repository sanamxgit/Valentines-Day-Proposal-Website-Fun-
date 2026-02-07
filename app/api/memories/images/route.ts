import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

// GET - Fetch all memory images (1.jpeg through 7.jpeg) from blob storage
export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return NextResponse.json({ images: [] });
    }

    try {
      // List all blobs
      const { blobs } = await list({ 
        limit: 100,
        token: token 
      });
      
      // Find images named 1.jpeg, 2.jpeg, etc. (up to 7.jpeg)
      const imageMap: Record<number, string> = {};
      
      for (let i = 1; i <= 7; i++) {
        // Try multiple patterns: "1.jpeg", "1.jpg", "/1.jpeg", etc.
        const patterns = [
          `${i}.jpeg`,
          `${i}.jpg`,
          `/${i}.jpeg`,
          `/${i}.jpg`,
          `memory-${i}.jpeg`,
          `memory-${i}.jpg`,
        ];
        
        const foundBlob = blobs.find(blob => {
          const pathname = blob.pathname.toLowerCase();
          return patterns.some(pattern => 
            pathname === pattern.toLowerCase() || 
            pathname.endsWith(pattern.toLowerCase()) ||
            pathname.includes(pattern.toLowerCase())
          );
        });
        
        if (foundBlob) {
          imageMap[i] = foundBlob.url;
        }
      }
      
      // Convert to array format [url1, url2, ...] for indices 1-7
      const images: string[] = [];
      for (let i = 1; i <= 7; i++) {
        images.push(imageMap[i] || '');
      }
      
      return NextResponse.json({ images });
    } catch (error) {
      console.error('Error fetching images from blob:', error);
      return NextResponse.json({ images: Array(7).fill('') });
    }
  } catch (error) {
    console.error('Error in GET /api/memories/images:', error);
    return NextResponse.json({ images: Array(7).fill('') });
  }
}
