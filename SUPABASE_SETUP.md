# Supabase Setup Instructions

This guide will help you set up Supabase for your StudyHelper app to enable cloud storage and user authentication.

## 1. Install Dependencies

First, install the Supabase client library:

```bash
npm install @supabase/supabase-js
```

## 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or sign in
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: StudyHelper
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
7. Click "Create new project"

## 3. Get Your Project URLs and Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**
   - **Project API keys** > **anon** > **public**

## 4. Set Up Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Existing OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Add Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 5. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and run this SQL:

```sql
-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  questions TEXT[] NOT NULL,
  demo_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX documents_user_id_idx ON documents(user_id);
CREATE INDEX documents_created_at_idx ON documents(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own documents
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy for users to insert their own documents
CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy for users to update their own documents
CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own documents
CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);
```

## 6. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Configure the following settings:

### Email Settings
- **Enable email confirmations**: Disabled (for development)
- **Enable email change confirmations**: Disabled (for development)

### URL Configuration
- **Site URL**: `http://localhost:3005` (for development)
- **Redirect URLs**: `http://localhost:3005/**`

### Providers
- **Email**: Enabled (already enabled by default)

## 7. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app at `http://localhost:3005`

3. Try the following:
   - Click "Sign In for Cloud Save"
   - Create a new account
   - Process a document and save it
   - Sign out and sign back in
   - Verify your documents are still there

## 8. Features Enabled

✅ **User Authentication**: Sign up, sign in, sign out  
✅ **Cloud Storage**: Documents saved to Supabase database  
✅ **Data Persistence**: Documents survive browser refresh  
✅ **User Isolation**: Users only see their own documents  
✅ **Backward Compatibility**: localStorage documents still work  

## 9. Production Deployment

When deploying to production:

1. Update environment variables in your hosting platform
2. Update Supabase authentication URLs:
   - **Site URL**: Your production domain
   - **Redirect URLs**: Your production domain + `/**`

## Troubleshooting

### Common Issues

1. **"Cannot find module '@supabase/supabase-js'"**
   - Run: `npm install @supabase/supabase-js`

2. **"Row Level Security policy violation"**
   - Check that RLS policies are created correctly
   - Verify user is authenticated when trying to access documents

3. **Authentication not working**
   - Check environment variables are set correctly
   - Verify Supabase project URL and keys
   - Check browser console for errors

4. **Documents not saving**
   - Check database table exists
   - Verify user has permission to insert
   - Check browser console for errors

### Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) 