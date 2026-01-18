# Password Reset Configuration Guide

## Issue
The password reset emails are redirecting to `http://localhost:3000` instead of your production URL.

## Solution

### Step 1: Update Supabase Email Template

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open Email Templates**
   - Click "Authentication" in sidebar
   - Click "Email Templates"
   - Select "Reset Password" template

3. **Update the Redirect URL**

Find this line in the template:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

The `{{ .ConfirmationURL }}` automatically includes a `redirect_to` parameter. You need to configure where it redirects.

### Step 2: Configure Site URL

1. **Go to Authentication Settings**
   - Authentication → URL Configuration

2. **Update Site URL**
   - For production: `https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app`
   - For development: `http://localhost:5173`

3. **Add Redirect URLs** (under "Redirect URLs")
   Add both:
   ```
   http://localhost:5173/reset-password
   https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/reset-password
   ```

### Step 3: Custom Email Template (Recommended)

Replace the default template with:

```html
<h2>Reset Password</h2>

<p>Hi there,</p>

<p>You recently requested to reset your password. Click the button below to set a new password:</p>

<p>
  <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery"
     style="background-color: #2D5F4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Reset Password
  </a>
</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>This link expires in 1 hour.</p>

<p>Thanks,<br>Health Tracker Team</p>
```

### Step 4: Environment-Specific Configuration

**For Multiple Environments:**

In your Supabase project settings:

**Production:**
- Site URL: `https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app`
- Redirect URLs: `https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app/**`

**Development:**
- Additional Redirect URL: `http://localhost:5173/**`

### Step 5: Test the Flow

1. Trigger password reset from production site
2. Check email - link should point to production URL
3. Click link → should open ResetPasswordPage on production
4. Enter new password → should update successfully
5. Redirect to login → sign in with new password

## Verification Checklist

- [ ] Site URL updated in Supabase Auth settings
- [ ] Redirect URLs include both localhost and production
- [ ] Email template uses `{{ .SiteURL }}` or correct domain
- [ ] Test email points to production URL (not localhost)
- [ ] Reset page loads successfully
- [ ] Password can be updated
- [ ] Can login with new password

## Quick Fix (If Urgent)

If you need an immediate fix:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL to: `https://health-tracker-nmlqo4xri-pjvalentines-projects.vercel.app`
3. Click Save

The next password reset email will use the correct URL.

## Common Issues

**Issue:** Still redirecting to localhost
- **Fix:** Clear browser cache, request new reset email

**Issue:** "Invalid redirect URL" error
- **Fix:** Add the URL to "Redirect URLs" in Supabase settings

**Issue:** Token expired
- **Fix:** Tokens expire in 1 hour - request a new reset email

## Technical Details

**How it works:**
1. User clicks "Forgot Password"
2. Supabase sends email with magic link
3. Link includes: `{{ .SiteURL }}/reset-password?token=xxx&type=recovery`
4. User clicks link → opens ResetPasswordPage
5. Page reads token from URL
6. User enters new password
7. `supabase.auth.updateUser({ password })` called
8. Redirect to login

**The ResetPasswordPage is already implemented at:**
- File: `src/pages/ResetPasswordPage.jsx`
- Route: `/reset-password`
- Status: ✅ Working (just needs correct URL)
