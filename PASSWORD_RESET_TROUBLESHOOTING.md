# Password Reset Troubleshooting Guide

## Current Issue
Password reset showing "Invalid or expired reset link" error.

## Root Cause Analysis

### Token Format Issue
Your reset token (`43224331`) is an **8-digit numeric code**, but Supabase recovery tokens should be **long alphanumeric hashes** (e.g., `pkce_8f9a2b3c4d5e6f7g8h9i0j1k2l3m4n5o`).

This indicates:
1. Supabase Site URL is not configured correctly
2. Email template may be using wrong token variable
3. Token type mismatch between email and validation code

---

## Fix Steps (In Order)

### Step 1: Configure Supabase URLs

1. Go to: https://supabase.com/dashboard
2. Select your **health-tracker** project
3. Navigate to: **Authentication** → **URL Configuration**

4. Set **Site URL** to:
   ```
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app
   ```

5. Add to **Redirect URLs** (one per line):
   ```
   http://localhost:5173/**
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/**
   ```

6. Click **Save**

### Step 2: Verify Email Template

1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Click **Reset Password (Change)** template
3. Verify the reset link uses this format:
   ```html
   <a href="{{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=recovery">
     Reset Password
   </a>
   ```

4. **Key variables:**
   - `{{ .SiteURL }}` - Your site URL (configured in Step 1)
   - `{{ .TokenHash }}` - The recovery token hash
   - `&type=recovery` - Required parameter

5. If the template is different, update it to match above

6. Click **Save**

### Step 3: Test With Fresh Token

**IMPORTANT:** Old tokens won't work after configuration changes!

1. Go to: https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/login
2. Click "Forgot Password?"
3. Enter your email
4. Submit

5. **Check your email** - the reset link should now be:
   ```
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/reset-password?token=pkce_xxxxx&type=recovery
   ```
   (Token should be a LONG hash, not 8 digits)

6. **Before clicking the link**, open browser DevTools:
   - Press `F12` or `Cmd+Option+I`
   - Click **Console** tab
   - Keep it open

7. **Click the reset link**

8. **Watch the console output** - you should see:
   ```
   === Password Reset Debug Info ===
   Full URL: https://...
   Hash:
   Search: ?token=pkce_xxxxx&type=recovery
   Tokens found: {
     hashAccessToken: 'missing',
     hashRefreshToken: 'missing',
     hashType: 'none',
     queryToken: 'present (pkce_xxxxx...)',
     queryType: 'recovery'
   }
   Query token found, attempting verification...
   Attempting verifyOtp with token_hash...
   ✓ Session created successfully from recovery token
   ✓ Session verified and accessible
   ```

9. If you see ✓ checkmarks, the form should appear - enter your new password!

---

## Expected Console Output

### ✅ Success (What you want to see):
```
=== Password Reset Debug Info ===
Full URL: https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/reset-password?token=pkce_abc123...&type=recovery
Hash:
Search: ?token=pkce_abc123...&type=recovery
Tokens found: {
  hashAccessToken: 'missing',
  hashRefreshToken: 'missing',
  hashType: 'none',
  queryToken: 'present (pkce_abc123...)',
  queryType: 'recovery'
}
Query token found, attempting verification...
Attempting verifyOtp with token_hash...
✓ Session created successfully from recovery token
Session user: abc-123-def-456
✓ Session verified and accessible
```

### ❌ Token Expired:
```
❌ verifyOtp failed: {message: "Token has expired", status: 400}
Error details: {
  message: "Token has expired",
  status: 400,
  code: "otp_expired"
}
```
**Fix:** Request a new password reset (tokens expire in 1 hour)

### ❌ Invalid Token Format:
```
❌ verifyOtp failed: {message: "Invalid token", status: 422}
Error details: {
  message: "Invalid token",
  status: 422,
  code: "invalid_token"
}
```
**Fix:** Check email template configuration (Step 2 above)

### ❌ Wrong Site URL:
```
❌ verifyOtp failed: {message: "Invalid redirect URL", status: 400}
```
**Fix:** Update Site URL and Redirect URLs in Supabase (Step 1 above)

---

## Common Problems & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| Token is 8 digits (like `43224331`) | Email template using wrong variable or Supabase generating OTP instead of recovery link | Update email template to use `{{ .TokenHash }}` |
| "Invalid or expired reset link" | Token expired (>1 hour old) OR Supabase Site URL mismatch | Request fresh reset after configuring Site URL |
| Email goes to localhost | Site URL set to `http://localhost:3000` | Change Site URL to production URL |
| "Invalid redirect URL" | Production URL not in Redirect URLs list | Add production URL to Redirect URLs |
| Form doesn't appear | JavaScript error or token validation failed | Check browser console for errors |
| "Auth session missing!" when submitting | Session not created from token | Check console logs - verifyOtp may have failed |

---

## Advanced Debugging

If you're still having issues, send me a screenshot of:

1. **Browser Console** (F12 → Console tab) showing all the debug logs
2. **The URL** in the address bar
3. **The email content** showing the reset link format
4. **Supabase Dashboard** → Authentication → URL Configuration page

With this information, I can pinpoint the exact issue.

---

## Code Changes Made

The enhanced debugging was added in commit `4649dce`:

**What changed:**
- ✅ Removed requirement for `type=recovery` parameter (now handles any query token)
- ✅ Added comprehensive console logging to track token flow
- ✅ Log detailed Supabase error responses
- ✅ Show full URL and all parameters for debugging
- ✅ Clear visual indicators (✓ / ❌) in console output

**Files modified:**
- `src/pages/ResetPasswordPage.jsx` - Enhanced token validation and debugging

---

## Next Steps

1. **Complete Steps 1-3 above** (configure Supabase, verify template, test)
2. **Share console output** with me if you still see errors
3. Once working, consider adding both dev and prod URLs to Redirect URLs so you can test locally too

The code is ready - we just need to ensure Supabase is configured correctly!
