# Lumière — AI Beauty Companion

## How to Deploy (Easy Mode)

### Step 1: Go to Vercel
1. Visit **vercel.com** and sign up (free)
2. Click **"Add New..." → "Project"**

### Step 2: Upload this folder
1. Click the **"Browse a template"** OR drag this entire `lumiere-vercel` folder into the upload area
2. OR go to **vercel.com/new** and click "Deploy" → upload the ZIP

### Step 3: Add your API key (CRUCIAL)
Before deploying, click **"Environment Variables"** and add:
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** `sk-ant-...` (your actual key from console.anthropic.com)

### Step 4: Click Deploy!
Vercel will build and deploy your app. You'll get a public URL like:
**lumiere-xyz.vercel.app**

### Step 5: Test it
Open the URL on your phone. The camera and AI will work!

## Project Structure
- `index.html` - Main HTML
- `src/App.jsx` - Your Lumière app (frontend)
- `src/main.jsx` - React entry point
- `api/analyze.js` - **Secure backend** — your API key lives here, hidden!
- `package.json` - Dependencies
- `vite.config.js` - Build config

## Why this is secure
Your API key is stored as an **environment variable in Vercel** — it never appears in the browser code. The `/api/analyze` endpoint runs on Vercel's servers and calls Anthropic on your behalf.
