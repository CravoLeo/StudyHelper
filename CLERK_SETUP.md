# Clerk Authentication Setup

## Step 1: Install Clerk Package
```bash
npm install @clerk/nextjs
```

## Step 2: Create/Update .env.local
Create a `.env.local` file in your project root with:

```env
# OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase configuration (for database only)
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

## Step 3: Get Clerk Keys
1. Go to https://clerk.dev
2. Sign up/Sign in
3. Create a new application
4. Go to "API Keys" in dashboard
5. Copy your Publishable Key and Secret Key
6. Add them to your `.env.local` file

## Step 4: The files will be updated automatically
Your layout.tsx and page.tsx will be updated to use Clerk authentication.

## Step 5: Run Your App
```bash
npm run dev
```

Your app will now use Clerk for authentication with Supabase for database! 