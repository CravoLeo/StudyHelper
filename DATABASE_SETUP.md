# Database Setup for Stripe Integration

## Complete SQL Setup Script

Run this complete SQL script in your Supabase SQL Editor:

```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_usage;
DROP TABLE IF EXISTS documents;

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,  -- Nullable for anonymous/demo usage
  file_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  questions TEXT[] NOT NULL,
  demo_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_usage table for Stripe integration
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,  -- Clerk user ID
  uses_remaining INTEGER NOT NULL DEFAULT 3,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'pro', 'unlimited')),
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX documents_user_id_idx ON documents(user_id);
CREATE INDEX documents_created_at_idx ON documents(created_at DESC);
CREATE INDEX user_usage_user_id_idx ON user_usage(user_id);
CREATE INDEX user_usage_plan_type_idx ON user_usage(plan_type);
CREATE INDEX user_usage_stripe_customer_idx ON user_usage(stripe_customer_id);

-- Create function and trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
CREATE TRIGGER update_documents_modtime
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_usage_modtime
BEFORE UPDATE ON user_usage
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Disable RLS for both tables (Clerk handles authorization at app level)
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage DISABLE ROW LEVEL SECURITY;

-- Add comments to clarify the security model
COMMENT ON TABLE documents IS 'Document storage with Clerk-based authentication. RLS disabled - authorization handled at application level. user_id can be null for anonymous/demo usage.';
COMMENT ON TABLE user_usage IS 'User usage tracking for Stripe integration. RLS disabled - authorization handled at application level with Clerk.';
```

## Alternative: Add Only the user_usage Table

If you want to keep your existing `documents` table as-is and just add the `user_usage` table, run this:

```sql
-- Create user_usage table for Stripe integration
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,  -- Clerk user ID
  uses_remaining INTEGER NOT NULL DEFAULT 3,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'pro', 'unlimited')),
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX user_usage_user_id_idx ON user_usage(user_id);
CREATE INDEX user_usage_plan_type_idx ON user_usage(plan_type);
CREATE INDEX user_usage_stripe_customer_idx ON user_usage(stripe_customer_id);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_user_usage_modtime
BEFORE UPDATE ON user_usage
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Disable RLS (following your existing pattern)
ALTER TABLE user_usage DISABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE user_usage IS 'User usage tracking for Stripe integration. RLS disabled - authorization handled at application level with Clerk.';
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_UNLIMITED_PRICE_ID=price_...
```

## Next Steps

1. **Run the SQL** to create the `user_usage` table
2. **Set up Stripe Dashboard** products and get the price IDs
3. **Configure webhook** endpoint in Stripe Dashboard
4. **Test the integration** with Stripe test cards

Once you run the SQL, the usage tracking errors will disappear and your Stripe integration will be fully functional! 