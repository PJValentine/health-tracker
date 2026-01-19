# Health Tracker - Complete Project Learnings & Best Practices

This document captures all learnings from building the Health Tracker app from scratch, organized for reuse in future projects.

---

## Table of Contents
1. [Git & Version Control](#git--version-control)
2. [Supabase Setup & Integration](#supabase-setup--integration)
3. [Authentication & Security](#authentication--security)
4. [Database Design](#database-design)
5. [Data Persistence & Sync](#data-persistence--sync)
6. [UI/UX Development](#uiux-development)
7. [Deployment](#deployment)
8. [Debugging & Troubleshooting](#debugging--troubleshooting)
9. [Common Pitfalls](#common-pitfalls)

---

## Git & Version Control

### Initial Setup
```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"

# Connect to remote
git remote add origin <repo-url>
git push -u origin main
```

### Branch Strategy
- **Main branch**: Protected, requires PR for merges
- **Feature branches**: Named `claude/<feature-name>-<sessionId>`
- Always develop on feature branches, never push directly to main

### Best Practices
1. **Commit messages should be descriptive**:
   ```bash
   # Good
   git commit -m "Fix data persistence issue - clear both localStorage and Supabase"

   # Bad
   git commit -m "fix bug"
   ```

2. **Atomic commits**: One logical change per commit

3. **Push with retry logic** for network issues:
   ```bash
   for i in 1 2 3 4; do
     git push && break || sleep $((i * 2))
   done
   ```

4. **Use specific branch for git operations**:
   - Avoid pushing to main if it's protected
   - Reset to remote if out of sync: `git reset --hard origin/main`

### Common Git Commands
```bash
# Check current status
git status
git branch --show-current

# Switch branches
git checkout <branch-name>

# Merge feature to main
git checkout main
git merge <feature-branch>

# Reset to remote state
git reset --hard origin/main
```

---

## Supabase Setup & Integration

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Create new project
3. Save credentials (NEVER commit to git):
   - Project URL
   - Anon/Public Key

### 2. Environment Variables
Create `.env` file (add to `.gitignore`):
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Client Setup
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
```

### 4. Key Configurations

#### Authentication URLs
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**:
  ```
  http://localhost:5173/**
  https://your-app.vercel.app/**
  ```

#### Email Templates
For password reset, use `{{ .ConfirmationURL }}`:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

**NOT** manual construction like:
```html
<!-- DON'T DO THIS - causes token issues -->
<a href="{{ .SiteURL }}/reset-password?token={{ .Token }}">
```

---

## Authentication & Security

### Auth Context Pattern
```javascript
// src/contexts/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        clearLocalStorage()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ... auth methods
}
```

### Protected Routes
```javascript
// src/components/ProtectedRoute.jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />

  return children
}
```

### Password Reset Flow

**Critical Points**:
1. Token comes from email link (hash or query params)
2. Use `verifyOtp()` to exchange token for session
3. Check for both token formats (hash-based and query-based)
4. Session must exist before calling `updateUser()`

```javascript
// Handle hash-based tokens (modern Supabase)
const hashParams = new URLSearchParams(window.location.hash.substring(1))
const accessToken = hashParams.get('access_token')
const refreshToken = hashParams.get('refresh_token')

if (accessToken && refreshToken) {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    // Show password reset form
  }
}

// Handle query-based tokens (legacy)
const token = searchParams.get('token')
if (token) {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'recovery'
  })
  if (data.session) {
    // Show password reset form
  }
}
```

---

## Database Design

### Schema Naming Conventions
- **Database**: `snake_case` (e.g., `user_id`, `weight_logs`, `created_at`)
- **Application**: `camelCase` (e.g., `userId`, `weightLogs`, `createdAt`)

### Required Tables
```sql
-- User Settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  units TEXT DEFAULT 'kg',
  name TEXT,
  profile_picture TEXT,
  theme JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Weight Logs
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, date DESC);
```

### Row Level Security (RLS)

**CRITICAL**: Always enable RLS on tables with user data

```sql
-- Enable RLS
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own weight logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);
```

### Schema Transform Functions

**ALWAYS** transform between database and app schemas:

```javascript
// Database → App
function transformWeightLogFromDB(dbLog) {
  return {
    id: dbLog.id,
    type: 'weight',
    valueKg: parseFloat(dbLog.weight),     // DB: weight → App: valueKg
    timestamp: new Date(dbLog.date).toISOString(),
    note: dbLog.notes,                     // DB: notes → App: note
  }
}

// App → Database
function transformWeightLogToDB(appLog) {
  return {
    user_id: userId,
    weight: parseFloat(appLog.weight),     // App: weight → DB: weight
    date: appLog.timestamp.split('T')[0],
    notes: appLog.notes || null,           // App: notes → DB: notes
  }
}
```

---

## Data Persistence & Sync

### Dual Storage Strategy

**localStorage** (fast, offline) + **Supabase** (persistent, cross-device)

### Implementation Pattern

```javascript
// 1. Save to localStorage immediately (optimistic UI)
function addWeightEntry(entry) {
  const newState = { ...state, weightEntries: [...state.weightEntries, entry] }
  updateState(newState)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
}

// 2. Sync to Supabase in background (fire-and-forget)
useEffect(() => {
  if (user && entry) {
    supabaseSync.addWeightLog(user.id, entry)
      .catch(err => console.error('Sync failed:', err))
  }
}, [entry])

// 3. Load from Supabase on login
async function loadFromSupabase() {
  const data = await supabaseSync.syncAllDataFromSupabase(userId)
  updateState(data)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
```

### User Isolation

**CRITICAL**: Prevent data leakage between users

```javascript
const USER_ID_KEY = 'health-tracker-user-id'

// On login
localStorage.setItem(USER_ID_KEY, user.id)

// Before loading data
const storedUserId = localStorage.getItem(USER_ID_KEY)
if (storedUserId && storedUserId !== currentUser.id) {
  // Different user - clear localStorage
  localStorage.clear()
}
```

### Clear All Data Pattern

```javascript
async function clearAllData() {
  const userId = await getUserId()

  // 1. Clear from Supabase
  if (userId && supabase) {
    await Promise.allSettled([
      supabase.from('weight_logs').delete().eq('user_id', userId),
      supabase.from('mood_logs').delete().eq('user_id', userId),
      // ... other tables
    ])
  }

  // 2. Clear localStorage
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(USER_ID_KEY)

  // 3. Reset app state
  updateState(initialState)
}
```

### Common Supabase Patterns

```javascript
// Use maybeSingle() instead of single() to avoid errors
const { data } = await supabase
  .from('user_settings')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle()  // Returns null if no rows, doesn't throw

// Use upsert() for insert-or-update
const { error } = await supabase
  .from('user_settings')
  .upsert(
    { user_id: userId, units: 'kg' },
    { onConflict: 'user_id' }
  )

// Use Promise.allSettled() for bulk operations
const results = await Promise.allSettled([
  deleteWeight(),
  deleteMood(),
  deleteNutrition()
])
// Check individual results, don't fail entire operation if one fails
```

---

## UI/UX Development

### Glassmorphism Design Pattern

```css
.card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

### Background Image Setup

```css
/* Full opacity background */
.app-shell::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('your-image-url');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  opacity: 1;  /* or 0.5 for subtle */
  z-index: -1;
  pointer-events: none;
}
```

### Responsive Layout

```css
/* Mobile-first approach */
.main-content-inner {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 640px) {
  .main-content-inner {
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 768px) {
  .main-content-inner {
    padding: 2rem;
  }
}
```

### Form Validation

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()

  // Client-side validation
  const weightValue = parseFloat(weight)

  if (isNaN(weightValue) || weightValue <= 0) {
    toast.error('Please enter a valid weight')
    return
  }

  // Realistic bounds
  const valueKg = units === 'lb' ? lbToKg(weightValue) : weightValue
  if (valueKg < 20 || valueKg > 500) {
    toast.error('Weight must be between 20-500 kg')
    return
  }

  // Character limits
  if (note.length > 500) {
    toast.error('Note must be less than 500 characters')
    return
  }

  // Submit
  await submitData()
}
```

### Confirmation Dialogs

**DON'T** use browser `confirm()`:
```javascript
// BAD
if (confirm('Delete all data?')) {
  deleteData()
}
```

**DO** create custom dialog component:
```javascript
// GOOD
const [showConfirm, setShowConfirm] = useState(false)

<ConfirmDialog
  isOpen={showConfirm}
  title="Clear All Data?"
  message="This will permanently delete everything."
  confirmText="Clear Data"
  cancelText="Cancel"
  onConfirm={handleConfirm}
  onCancel={() => setShowConfirm(false)}
  danger={true}
/>
```

### Toast Notifications

```javascript
// src/lib/toast.js
export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info'),
}

// Usage
toast.success('Weight logged successfully')
toast.error('Failed to save data')
```

---

## Deployment

### Vercel Setup

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables**:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```
3. **Deploy settings**:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### vercel.json Configuration

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Branch Deployments

- **Main branch**: `your-app.vercel.app` (production)
- **Feature branches**: `your-app-git-branch-name.vercel.app` (preview)

### Cache Busting

After deployment, users may see cached version:
- **Solution**: Hard refresh with `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## Debugging & Troubleshooting

### Console Logging Strategy

```javascript
// Use structured logging with emojis for visibility
console.log('=== Password Reset Debug Info ===')
console.log('✓ Session created successfully')
console.log('❌ Token validation failed')
console.log('⚠️  Using legacy token format')

// Log important data structures
console.log('Tokens found:', {
  hashToken: token ? 'present' : 'missing',
  queryToken: token2 ? 'present' : 'missing'
})
```

### Common Issues & Solutions

#### Issue: Data reappears after clearing
**Cause**: Only cleared localStorage, not Supabase
**Solution**: Clear both storage locations

#### Issue: NaN or undefined in charts
**Cause**: Field name mismatch between DB and app
**Solution**: Create transform functions, add defensive parsing

#### Issue: "Auth session missing"
**Cause**: Password reset token not properly exchanged for session
**Solution**: Use `verifyOtp()` method

#### Issue: Supabase sync errors
**Cause**: Using `.single()` on empty table, or `.insert()` on existing row
**Solution**: Use `.maybeSingle()` and `.upsert()`

#### Issue: Cross-user data contamination
**Cause**: Not checking user ID in localStorage
**Solution**: Store and verify user ID before loading data

### Browser DevTools

**Network Tab**: Check Supabase API calls
- Look for 401/403 errors (auth issues)
- Check request payloads

**Application Tab**: Inspect localStorage
- Verify data structure
- Check user ID

**Console Tab**: Watch for errors and logs

---

## Common Pitfalls

### 1. Field Name Mismatches

❌ **Bad**:
```javascript
// Assuming DB field name matches app property
const weight = dbLog.weight  // Undefined if DB uses 'value'
```

✅ **Good**:
```javascript
// Always transform explicitly
const weight = dbLog.value || dbLog.weight
```

### 2. Missing Null Checks

❌ **Bad**:
```javascript
const average = data.reduce((sum, item) => sum + item.value, 0) / data.length
```

✅ **Good**:
```javascript
if (!data || data.length === 0) return 0
const validData = data.filter(item => item.value != null)
const average = validData.reduce((sum, item) => sum + item.value, 0) / validData.length
```

### 3. Forgetting RLS Policies

❌ **Bad**:
```sql
-- Table created without RLS - ANYONE can access ANY data!
CREATE TABLE weight_logs (...)
```

✅ **Good**:
```sql
CREATE TABLE weight_logs (...)
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see own data" ON weight_logs
  USING (auth.uid() = user_id);
```

### 4. Committing Secrets

❌ **Bad**:
```javascript
// In committed code
const supabaseUrl = 'https://abc123.supabase.co'
const supabaseKey = 'eyJhbGci...'  // EXPOSED!
```

✅ **Good**:
```javascript
// In .env (not committed)
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

// In code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
```

### 5. Not Handling Async Errors

❌ **Bad**:
```javascript
async function loadData() {
  const data = await fetchData()  // No error handling
  setState(data)
}
```

✅ **Good**:
```javascript
async function loadData() {
  try {
    const data = await fetchData()
    setState(data)
  } catch (error) {
    console.error('Failed to load data:', error)
    toast.error('Could not load data')
  }
}
```

### 6. Direct Push to Protected Main Branch

❌ **Bad**:
```bash
git checkout main
git commit -m "changes"
git push origin main  # Will fail if main is protected
```

✅ **Good**:
```bash
git checkout -b feature/my-feature
git commit -m "changes"
git push origin feature/my-feature
# Then create PR on GitHub
```

---

## Quick Reference Checklists

### Starting a New Project

- [ ] Initialize git repository
- [ ] Create `.gitignore` with `.env`, `node_modules/`, `dist/`
- [ ] Create Supabase project and save credentials
- [ ] Set up `.env` file with Supabase keys
- [ ] Create database tables with RLS policies
- [ ] Set up authentication URLs in Supabase dashboard
- [ ] Configure email templates (use `{{ .ConfirmationURL }}`)
- [ ] Connect to Vercel and configure environment variables
- [ ] Create feature branch for development

### Before Each Feature

- [ ] Create feature branch from main
- [ ] Read relevant files before editing
- [ ] Write tests/validation before implementing
- [ ] Consider data persistence (localStorage + Supabase)
- [ ] Add error handling and loading states
- [ ] Test with and without network connection
- [ ] Check for field name mismatches
- [ ] Add defensive null checks

### Before Pushing

- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Tested core functionality
- [ ] Sensitive data not in code
- [ ] Commit message is descriptive
- [ ] Push to feature branch (not main)

### Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Supabase Site URL matches production URL
- [ ] Redirect URLs include production domain
- [ ] RLS policies enabled on all tables
- [ ] Email templates use correct URLs
- [ ] Database migrations applied
- [ ] Hard refresh after deployment to clear cache

---

## Time-Saving Commands

### Quick Setup Script
```bash
#!/bin/bash
# setup-new-project.sh

# Git
git init
echo "node_modules/\ndist/\n.env" > .gitignore

# Environment
echo "VITE_SUPABASE_URL=" > .env
echo "VITE_SUPABASE_ANON_KEY=" >> .env

# Initial commit
git add .
git commit -m "Initial project setup"

echo "✅ Project initialized. Add Supabase credentials to .env"
```

### Common Git Workflows
```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b claude/my-feature-abc123

# Commit and push
git add .
git commit -m "Descriptive message"
git push -u origin claude/my-feature-abc123

# Merge to main (if not protected)
git checkout main
git merge claude/my-feature-abc123
git push origin main
```

### Database Quick Setup
```sql
-- Run this for every new table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_name" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

---

## Key Takeaways

1. **Always use feature branches** - Never push directly to protected main
2. **Enable RLS on all user tables** - Security by default
3. **Transform data between DB and app schemas** - Prevents NaN/undefined bugs
4. **Store user ID in localStorage** - Prevent cross-user data leakage
5. **Use verifyOtp() for password reset** - Proper token-to-session exchange
6. **Clear both localStorage AND Supabase** - Complete data deletion
7. **Use .maybeSingle() and .upsert()** - Graceful error handling
8. **Add null checks everywhere** - Defensive programming
9. **Never commit .env files** - Security first
10. **Hard refresh after deployment** - Clear browser cache

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **React Hooks**: https://react.dev/reference/react
- **Git Best Practices**: https://git-scm.com/book/en/v2

---

**Last Updated**: Jan 18, 2026
**Project**: Health Tracker
**Tech Stack**: React + Vite + Supabase + Vercel
