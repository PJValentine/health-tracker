# Instructions for Claude Chrome Extension - Supabase Configuration

## Step 1: Navigate to Supabase Dashboard

1. Open Chrome and go to: https://supabase.com/dashboard
2. Log in to your account
3. Select your **health-tracker** project

---

## Step 2: Give Claude These Instructions

Once you're on the Supabase dashboard, **activate Claude Chrome Extension** and paste this:

```
I need help configuring password reset for my Health Tracker app. Please help me:

1. Navigate to Authentication → URL Configuration

2. Update the Site URL to:
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app

3. In the Redirect URLs section, add these URLs (one per line):
   http://localhost:5173/**
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/**

4. Save the changes

5. Then navigate to Authentication → Email Templates

6. Select the "Reset Password (Change)" template

7. Verify the reset link in the template uses this format:
   <a href="{{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=recovery">Reset Password</a>

8. If the template uses {{ .Token }} instead of {{ .TokenHash }}, update it to use {{ .TokenHash }}

9. Save the email template

Please confirm when each step is complete and let me know if you see any errors.
```

---

## Step 3: After Claude Completes Configuration

Once Claude confirms the configuration is complete:

### Test the Password Reset Flow

1. Go to: https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/login

2. Click **"Forgot Password?"**

3. Enter your email address

4. Check your email for the password reset link

5. **IMPORTANT:** Before clicking the link, open browser DevTools:
   - Press `F12` (or `Cmd+Option+I` on Mac)
   - Click the **Console** tab
   - Keep it open

6. Click the password reset link from your email

7. **Watch the console output** - you should see:
   ```
   === Password Reset Debug Info ===
   Full URL: https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/reset-password?token=pkce_xxxxx...
   Tokens found: {
     queryToken: 'present (pkce_xxxxx...)'
     queryType: 'recovery'
   }
   ✓ Session created successfully from recovery token
   ✓ Session verified and accessible
   ```

8. If you see the ✓ checkmarks, enter your new password and submit!

---

## Expected Results

### ✅ Success:
- Site URL is set to production URL
- Redirect URLs include both localhost and production
- Email template uses `{{ .TokenHash }}`
- Password reset link in email is a long hash (not 8 digits)
- Console shows ✓ checkmarks
- Form appears and allows password reset

### ❌ If Still Failing:

Take a screenshot of:
1. Browser console output (all the debug logs)
2. The URL in the address bar
3. The password reset email showing the link format

Share these with me and I'll help debug further.

---

## Alternative: Manual Configuration

If Claude can't access the Supabase dashboard, here are the manual steps:

### URL Configuration

1. **Supabase Dashboard** → **Your Project** → **Authentication** → **URL Configuration**

2. Find **Site URL** field:
   - Current value: probably `http://localhost:3000`
   - Change to: `https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app`

3. Find **Redirect URLs** section:
   - Click **"Add URL"** or edit the text area
   - Add these URLs (one per line):
     ```
     http://localhost:5173/**
     https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/**
     ```

4. Click **Save**

### Email Template Configuration

1. **Supabase Dashboard** → **Your Project** → **Authentication** → **Email Templates**

2. Click **"Reset Password (Change)"** template

3. Find the reset link in the email HTML - look for something like:
   ```html
   <a href="{{ .ConfirmationURL }}">
   ```
   or
   ```html
   <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}">
   ```

4. Change it to:
   ```html
   <a href="{{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=recovery">
     Reset Password
   </a>
   ```

5. Click **Save**

---

## Why This Fixes The Issue

**Current Problem:**
- Your reset token is `43224331` (8 digits)
- Should be `pkce_abc123def456...` (long hash)

**Root Cause:**
- Supabase Site URL is set to localhost
- Email template may be using wrong token variable
- This causes Supabase to generate the wrong type of token

**The Fix:**
- Setting correct Site URL tells Supabase where your app lives
- Using `{{ .TokenHash }}` ensures the correct token type
- Adding redirect URLs allows the token to work on that domain

---

## After Successful Configuration

Once password reset works, you can test other features:
- Sign up new user
- Log in/out
- Update profile settings
- Verify all data syncs to Supabase

Everything should work smoothly once the auth configuration is correct!
