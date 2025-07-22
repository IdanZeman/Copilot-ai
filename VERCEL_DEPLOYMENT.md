# Vercel Deployment Guide

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Deploy
```bash
cd "c:\Users\Idanze\Projects\Copilot-ai"
vercel
```

## Step 4: Set Environment Variables
```bash
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted
```

## Step 5: Deploy Production
```bash
vercel --prod
```

## Your website will be available at:
`https://your-project-name.vercel.app`

## Custom Domain (Optional)
1. Go to vercel.com dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain

## Environment Variables Setup
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add: OPENAI_API_KEY = your_actual_api_key

## Automatic Deployments
- Every push to GitHub will automatically deploy
- Perfect for updates and maintenance

## Free Tier Limits
- 100GB bandwidth/month
- 100 serverless function executions/day
- More than enough for personal projects!
