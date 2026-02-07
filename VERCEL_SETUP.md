# Vercel Setup Instructions

## Setting up Vercel Blob Storage

To enable image uploads on Vercel, you need to set up Vercel Blob Storage. This is required because Vercel's serverless functions cannot write to the filesystem.

### Step-by-Step Setup:

1. **Go to your Vercel project dashboard** (https://vercel.com/dashboard)

2. **Navigate to your project** → Click on **"Storage"** tab (or go to **Settings** → **Storage**)

3. **Click "Create Database"** or **"Add Integration"**

4. **Select "Blob"** from the available storage options

5. **Follow the setup wizard** - Vercel will automatically:
   - Create the Blob storage
   - Add the `BLOB_READ_WRITE_TOKEN` environment variable to your project
   - Make it available to all your deployments

6. **Redeploy your project** (or push a new commit) to apply the changes

### Alternative: Manual Token Setup

If you prefer to set it up manually:

1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Get this from Vercel dashboard → Storage → Blob → Settings → Tokens
   - **Environment**: Select all (Production, Preview, Development)

## After Setup

Once Vercel Blob is configured:
- ✅ Images will be uploaded to Vercel Blob Storage
- ✅ Memory data will be stored in Vercel Blob as well
- ✅ Everything will persist and be accessible via the shared link
- ✅ Images will have public URLs that work for anyone with the link

## Testing Locally

For local development, you'll need to:

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add: `BLOB_READ_WRITE_TOKEN=your_token_here`
3. Get your token from:
   - Vercel dashboard → Your Project → Storage → Blob → Settings → Tokens
   - Or from the environment variables in your Vercel project settings

4. Restart your dev server: `npm run dev`

**Note**: The token is automatically available in Vercel deployments once Blob Storage is set up, but you need to add it manually for local development.

## Troubleshooting

If you see "Blob storage not configured" error:
- Make sure you've created a Blob storage in your Vercel project
- Check that `BLOB_READ_WRITE_TOKEN` is set in your environment variables
- Redeploy your project after setting up Blob Storage
