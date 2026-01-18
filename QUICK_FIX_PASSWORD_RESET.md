# 🚨 QUICK FIX: Password Reset Redirect Issue

## Problem
Password reset emails redirect to `http://localhost:3000` instead of production URL.

## 2-Minute Fix

### Option 1: Update Site URL (Easiest)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Authentication** → **URL Configuration**
4. Update **Site URL** to:
   ```
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app
   ```
5. Click **Save**

✅ Done! Next reset email will use the correct URL.

### Option 2: Add Redirect URL (If Option 1 doesn't work)

1. Same location: **Authentication** → **URL Configuration**
2. Scroll to **Redirect URLs**
3. Add this URL:
   ```
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/**
   ```
4. Click **Save**

---

## Verify It Works

1. Go to your production site
2. Click "Forgot Password?"
3. Enter email and submit
4. Check email - the reset link should now point to:
   ```
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/reset-password?token=...
   ```
5. Click the link - you should see the "Set New Password" form
6. Enter new password → Success!

---

## What Was Already Fixed

✅ ResetPasswordPage component exists (`src/pages/ResetPasswordPage.jsx`)
✅ Route configured (`/reset-password`)
✅ Password validation (min 6 chars)
✅ Password confirmation
✅ Success state with auto-redirect
✅ Error handling

The **only** missing piece was the Supabase URL configuration.

---

## Screenshot Guide

**Step 1:** Find Authentication Settings
```
Supabase Dashboard → [Your Project] → Authentication → URL Configuration
```

**Step 2:** Update Site URL
```
Site URL: https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          (Change from http://localhost:3000)
```

**Step 3:** Add Redirect URLs (one per line)
```
http://localhost:5173/**
https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/**
```

**Step 4:** Save changes

---

## For Development

To test locally:

1. Set Site URL to: `http://localhost:5173`
2. Test password reset
3. Email will redirect to localhost
4. Enter new password

**Remember:** Change back to production URL when deploying!

---

## Alternative: Environment-Aware (Advanced)

If you want both dev and prod to work:

1. Keep Site URL as production
2. Add both URLs to Redirect URLs:
   - `http://localhost:5173/**`
   - `https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/**`
3. Supabase will auto-detect which environment the request came from

---

## Troubleshooting

**Problem:** Still redirecting to localhost after changing
**Solution:** Clear browser cache and request a new reset email

**Problem:** "Invalid redirect URL" error
**Solution:** Make sure you added the URL to **both** Site URL and Redirect URLs

**Problem:** Token expired
**Solution:** Tokens expire in 1 hour - request a new one

**Problem:** Can't update password
**Solution:** Check browser console for errors - may be CORS or network issue

---

## Technical Details

The reset flow:
1. User clicks "Forgot Password" → enters email
2. Supabase sends email with magic link
3. Magic link format: `[SITE_URL]/reset-password?token=xxx&type=recovery`
4. User clicks link → opens ResetPasswordPage
5. Page validates token from URL
6. User enters new password
7. Page calls `supabase.auth.updateUser({ password })`
8. Success → redirects to /login

The `[SITE_URL]` comes from your Supabase Auth settings.
