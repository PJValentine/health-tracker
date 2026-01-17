# Troubleshooting: Users Not Being Created in Supabase

## Quick Diagnostic Checklist

### 1. Check if Supabase is Actually Connected

Open your browser console (F12) when visiting the app and look for:

**✅ Good signs:**
- No "Missing Supabase environment variables" errors
- App redirects to `/login` page

**❌ Bad signs:**
- Console shows: "Missing Supabase environment variables"
- Console shows: "Running without authentication - Supabase not configured"
- App doesn't redirect to login (goes straight to dashboard)

### 2. Verify Environment Variables

#### **For Local Development:**
Check that `.env` file exists in project root with:
```
VITE_SUPABASE_URL=https://dkbhtddfrozvblwovmpw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NhMZTpAcIr_GkiKlRjYmwA_7lIp48SF
```

After adding/modifying `.env`, **restart dev server**:
```bash
# Stop server (Ctrl+C), then:
npm run dev
```

#### **For Vercel (Production):**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Verify these exist:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. If missing, add them and **redeploy**

### 3. Verify SQL Schema Was Run

The database tables need to be created in Supabase:

1. Go to: https://supabase.com/dashboard
2. Select `health-tracker` project
3. SQL Editor → History
4. Check if you see a query that created these tables:
   - `user_settings`
   - `weight_logs`
   - `mood_logs`
   - `nutrition_notes`
   - `health_connections`

**If NOT found:**
1. SQL Editor → New Query
2. Copy entire contents from `supabase-schema.sql`
3. Paste and Run
4. Should see: "Success. No rows returned"

### 4. Test User Creation

#### **Step-by-Step Test:**

1. **Clear browser data** (to start fresh):
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```

2. **Open browser console** (F12) and keep it open

3. **Go to signup page** and create account with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123

4. **Check console logs** for:
   ```
   Attempting signup for: test@example.com with name: Test User
   Signup response: { user: {...}, session: {...} }
   ```

5. **Check Supabase Dashboard**:
   - Authentication → Users
   - Should see new user with test@example.com
   - Database → Table Editor → `user_settings`
   - Should see one row with the user's ID

### 5. Common Issues & Solutions

#### Issue: "Missing Supabase environment variables"
**Solution:**
- Environment variables not loaded
- Restart dev server: `npm run dev`
- For Vercel: Add env vars and redeploy

#### Issue: Users appear in Auth but not in user_settings table
**Cause:** SQL trigger `on_auth_user_created` not created

**Solution:**
1. Go to SQL Editor in Supabase
2. Run this specifically:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Health Tracker User')
  );

  INSERT INTO public.health_connections (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### Issue: Email confirmation required
**Solution:**
1. Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. Toggle OFF for testing
4. Users can sign in immediately after signup

#### Issue: RLS (Row Level Security) errors
**Solution:**
The SQL schema should have created RLS policies. Check:
1. Database → Tables → user_settings → Policies
2. Should see policies like "Users can view their own settings"
3. If missing, re-run the full `supabase-schema.sql`

### 6. Verify Full Setup

Run this test after signup:

**In Browser Console:**
```javascript
// Check if Supabase is connected
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has API Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**In Supabase Dashboard:**

1. **Authentication → Users**: Should show your test user
2. **Database → user_settings**: Should have one row
3. **Database → health_connections**: Should have one row
4. **SQL Editor → New Query**: Run this:
   ```sql
   SELECT
     u.email,
     us.name,
     us.units,
     hc.status
   FROM auth.users u
   LEFT JOIN user_settings us ON us.user_id = u.id
   LEFT JOIN health_connections hc ON hc.user_id = u.id;
   ```
   Should return your user with settings

### 7. Reset and Start Fresh

If nothing works, complete reset:

**1. Delete test users:**
- Supabase → Authentication → Users
- Delete all test users

**2. Clear browser:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**3. Verify schema:**
- Supabase → SQL Editor
- Re-run entire `supabase-schema.sql`

**4. Restart dev server:**
```bash
npm run dev
```

**5. Create new account** and monitor console

### 8. Production (Vercel) Specific

If it works locally but not on Vercel:

1. **Verify environment variables are set in Vercel**
2. **Check Vercel deployment logs** for errors
3. **Redeploy** after adding env vars
4. **Test** by creating account on live site
5. **Check browser console** on live site for errors

### Getting Help

If still not working, provide:
1. Browser console errors (screenshot)
2. Supabase Authentication → Users (screenshot - count of users)
3. Supabase Database → user_settings (screenshot - row count)
4. Where you're testing (local or Vercel)
5. Whether SQL schema was run successfully
