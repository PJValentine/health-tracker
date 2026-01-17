# Vercel Deployment Guide

## Current Status

Your app is deployed at: **https://health-tracker-virid-zeta.vercel.app/**

The app currently works **without authentication** because the Supabase environment variables are not configured in Vercel. The app will use localStorage for data storage.

## Option 1: Run Without Authentication (Current Setup)

The app is configured to work without Supabase/authentication. Users can:
- ✅ Use all features (weight tracking, mood logging, nutrition notes)
- ✅ Data is saved to browser localStorage
- ✅ Theme customization works
- ⚠️ No user accounts (data is per-browser)
- ⚠️ Data not synced across devices

This is fine for a demo or personal use on a single browser.

## Option 2: Enable Full Authentication (Recommended for Production)

To enable user authentication and database storage on Vercel:

### Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your `health-tracker` project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://dkbhtddfrozvblwovmpw.supabase.co`
   - **Environment**: Production, Preview, Development (check all)

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `sb_publishable_NhMZTpAcIr_GkiKlRjYmwA_7lIp48SF`
   - **Environment**: Production, Preview, Development (check all)

5. Click **Save** for each variable

### Step 2: Set Up Supabase Database

Follow the instructions in `SUPABASE_SETUP.md`:

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your `health-tracker` project
3. Navigate to **SQL Editor** → **New Query**
4. Copy contents from `supabase-schema.sql`
5. Paste and click **Run**

### Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

OR

Just push a new commit to trigger automatic deployment.

### Step 4: Test Authentication

After redeployment with environment variables:

1. Visit your app: https://health-tracker-virid-zeta.vercel.app/
2. You'll be redirected to `/login`
3. Click "Don't have an account? Sign up"
4. Create your account
5. Start using the app with full authentication!

## How It Works

### Without Environment Variables (Current)
```
User visits app → No Supabase → Auth disabled → Direct access → localStorage data
```

### With Environment Variables (After Setup)
```
User visits app → Supabase configured → Auth required → Login/Signup → Database data
```

## Checking Environment Variables

To verify environment variables are set:

1. Open browser console (F12) on your deployed app
2. Check for these messages:
   - ❌ Without env vars: "Missing Supabase environment variables"
   - ✅ With env vars: No error messages, redirects to `/login`

## Troubleshooting

### App still shows blank screen after adding env vars
- Clear browser cache and hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check that you clicked "Save" for each environment variable
- Verify you selected all environments (Production, Preview, Development)
- Redeploy the app after adding variables

### App shows login page but can't sign up
- Make sure you ran the SQL schema in Supabase
- Check Supabase dashboard for any error logs
- Verify the environment variables are correct

### Data is lost after refresh
- This is expected with localStorage (Option 1)
- Enable authentication (Option 2) to persist data in Supabase
- Data will then sync across devices when logged in

## Security Notes

- The `VITE_SUPABASE_ANON_KEY` is safe to expose in client-side code
- It's a publishable key designed for browser use
- Row Level Security (RLS) in Supabase protects user data
- Users can only access their own data

## Local Development

The `.env` file is already configured for local development. To run locally:

```bash
npm run dev
```

This will use the environment variables from `.env` automatically.
