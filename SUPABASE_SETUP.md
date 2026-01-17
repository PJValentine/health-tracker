# Supabase Setup Guide for Health Tracker

This guide will help you set up Supabase authentication and database for the Health Tracker application.

## Prerequisites

- Supabase account (free tier works fine)
- Health Tracker project running locally

## Step 1: Supabase Project Setup

Your Supabase project is already configured:
- **Project URL**: https://dkbhtddfrozvblwovmpw.supabase.co
- **Publishable API Key**: (already in `.env`)

## Step 2: Create Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `health-tracker`
3. Navigate to the **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-schema.sql` (in the project root)
6. Paste it into the SQL editor
7. Click **Run** to execute the schema

This will create:
- ✅ 5 tables: `user_settings`, `weight_logs`, `mood_logs`, `nutrition_notes`, `health_connections`
- ✅ Row Level Security (RLS) policies for each table
- ✅ Indexes for performance
- ✅ Triggers for automatic timestamp updates
- ✅ Function to initialize user data on signup

## Step 3: Configure Authentication

### Email Authentication (Already Enabled)

Email authentication should already be enabled in your Supabase project. To verify:

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Ensure **Email** is enabled

### Optional: Customize Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates if desired:
   - Confirm signup
   - Magic link
   - Reset password

### Optional: Add OAuth Providers

You can add social login providers:
1. Go to **Authentication** → **Providers**
2. Enable providers like Google, GitHub, etc.
3. Follow the provider-specific setup instructions

## Step 4: Test Authentication

### Create Your First User

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Click "Don't have an account? Sign up"

4. Fill in:
   - Name: Your name
   - Email: your.email@example.com
   - Password: (minimum 6 characters)
   - Confirm Password: (same password)

5. Click **Create Account**

6. Check your email for a confirmation link (if email confirmation is enabled)

7. If email confirmation is disabled in Supabase settings, you can log in immediately

### Verify Database Records

After creating a user:

1. Go to **Database** → **Table Editor** in Supabase Dashboard
2. Check the `user_settings` table - should have one row
3. Check the `health_connections` table - should have one row
4. These were created automatically by the `handle_new_user()` trigger

### Test Login

1. Go to `http://localhost:5173/login`
2. Enter your email and password
3. Click **Sign In**
4. You should be redirected to the app dashboard

### Test Sign Out

1. Navigate to **Settings** page
2. Scroll to the **Account** section
3. Click **Sign Out**
4. You should be redirected to the login page

## Step 5: Database Integration

### Current Status

The application currently uses **localStorage** for data storage. The Supabase integration is prepared with:

- ✅ Authentication (Login/Signup/Logout)
- ✅ Protected routes
- ✅ Database schema created
- ✅ Sync functions ready (`src/lib/supabaseSync.js`)

### Next Steps for Full Integration

To fully integrate Supabase database (requires additional code changes):

1. Update `useHealthStore` to call Supabase sync functions
2. Modify data operations to save to Supabase
3. Load user data from Supabase on login
4. Implement real-time sync (optional)

## Environment Variables

Make sure `.env` exists in the project root with:

```env
VITE_SUPABASE_URL=https://dkbhtddfrozvblwovmpw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NhMZTpAcIr_GkiKlRjYmwA_7lIp48SF
```

**Important**:
- `.env` is already in `.gitignore`
- Never commit API keys to version control
- For production, use environment variables in your hosting platform

## Troubleshooting

### "Invalid API key" error

- Check that `.env` file exists in project root
- Restart dev server after creating/modifying `.env`
- Verify the API key matches your Supabase project

### "Row Level Security" errors

- Make sure you ran the entire `supabase-schema.sql` script
- RLS policies must be created for authenticated users to access data
- Check the **Authentication** → **Policies** section in Supabase Dashboard

### Email confirmation not working

- Check **Authentication** → **Settings** → **Email Auth**
- For development, you can disable "Confirm email" requirement
- For production, configure SMTP settings for custom email delivery

### User can't see their data

- Verify RLS policies are created (check SQL execution)
- Make sure user is authenticated (check browser console for errors)
- Check that `user_id` matches `auth.uid()` in database records

## Security Notes

1. **Row Level Security (RLS)**: Enabled on all tables - users can only access their own data
2. **API Keys**: The anon key is safe for client-side use (it's public)
3. **Passwords**: Handled securely by Supabase Auth (bcrypt hashing)
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Never commit `.env` to version control

## Database Schema Overview

```
┌─────────────────┐
│   auth.users    │  (Managed by Supabase Auth)
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┬──────────────┐
         │              │              │              │              │
┌────────▼────────┐ ┌──▼───────────┐ ┌▼─────────────┐ ┌▼──────────────┐ ┌▼───────────────────┐
│ user_settings   │ │ weight_logs  │ │ mood_logs    │ │nutrition_notes│ │health_connections │
├─────────────────┤ ├──────────────┤ ├──────────────┤ ├───────────────┤ ├────────────────────┤
│ - user_id (FK)  │ │- user_id (FK)│ │- user_id (FK)│ │- user_id (FK) │ │- user_id (FK)      │
│ - units         │ │- weight      │ │- mood        │ │- meal_type    │ │- status            │
│ - name          │ │- date        │ │- tags[]      │ │- notes        │ │- last_sync_at      │
│ - theme (JSON)  │ │- notes       │ │- notes       │ │- date         │ │- permissions (JSON)│
│ - images (JSON) │ │- created_at  │ │- date        │ │- created_at   │ │- created_at        │
└─────────────────┘ └──────────────┘ └──────────────┘ └───────────────┘ └────────────────────┘
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs in the Dashboard
3. Verify environment variables are loaded
4. Ensure database schema was created successfully
