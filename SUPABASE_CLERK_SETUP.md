# Supabase + Clerk Setup Instructions

Since you're using Clerk for authentication, here are the additional steps after completing Supabase setup through step 5.

## 6. Update Database Policies for Clerk

Since you won't be using Supabase auth, update your database policies. In your Supabase SQL Editor, run:

```sql
-- Drop existing RLS policies that depend on Supabase auth
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

-- Disable RLS for now (Clerk will handle authorization at app level)
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Optional: If you want to re-enable RLS later with Clerk user IDs, you can use:
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage own documents" ON documents
--   FOR ALL USING (user_id = current_setting('app.current_user_id', true));
```

## 7. Environment Variables

Your `.env.local` should have:

```env
# OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase configuration (for database only)
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Clerk will be added later
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
# CLERK_SECRET_KEY=your_clerk_secret_here
```

## 8. Database Schema Summary

Your `documents` table is ready for Clerk:

```sql
documents (
  id UUID PRIMARY KEY,
  user_id UUID,  -- This will store Clerk user IDs
  file_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  questions TEXT[] NOT NULL,
  demo_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## 9. What's Ready for Clerk Integration

✅ **Database table** created and ready  
✅ **Supabase client** configured for database operations  
✅ **CRUD functions** ready to accept Clerk user IDs  
✅ **No conflicting auth** - Supabase auth disabled  

## 10. Next Steps with Clerk

When you're ready to add Clerk:

1. Install Clerk: `npm install @clerk/nextjs`
2. Wrap your app with `ClerkProvider`
3. Use Clerk's `useUser()` hook to get user ID
4. Pass Clerk user ID to your existing database functions
5. Re-enable RLS with Clerk user context (optional)

## Benefits of This Approach

- **Best of both worlds**: Clerk's superior auth + Supabase's powerful database
- **Clean separation**: Auth and database concerns separated
- **Flexible**: Easy to switch auth providers later
- **Scalable**: Both services are production-ready 