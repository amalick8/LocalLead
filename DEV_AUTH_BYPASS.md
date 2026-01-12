# 🔓 DEV-ONLY Auth Bypass Guide

**⚠️ WARNING: This is for LOCAL DEVELOPMENT ONLY**

This document explains the temporary authentication bypass implemented for visual inspection of dashboards.

---

## What Was Changed

### 1. Route Protection Analysis

**Current Protection Mechanism:**
- **No route guards in `App.tsx`** - Routes are unprotected at routing level
- **Protection happens inside components:**
  - `Dashboard.tsx` (lines 16-23): Redirects if no user or if admin
  - `Admin.tsx` (lines 86-93): Redirects if no user or if not admin
  - Both components have early returns showing loading spinners

**Files Modified:**
- `src/pages/Dashboard.tsx`
- `src/pages/Admin.tsx`

---

## Changes Made

### Dashboard.tsx

**Added DEV flag:**
```typescript
// DEV ONLY — TEMPORARY AUTH BYPASS
const DEV_BYPASS_AUTH = true;
```

**Modified:**
1. **Line ~15**: Uses dummy user ID when bypass enabled
2. **Line ~18**: Skips redirect useEffect when bypass enabled
3. **Line ~27**: Skips loading/unauthorized check when bypass enabled

### Admin.tsx

**Added DEV flag:**
```typescript
// DEV ONLY — TEMPORARY AUTH BYPASS
const DEV_BYPASS_AUTH = true;
```

**Modified:**
1. **Line ~60**: Forces profiles query to enable when bypass enabled
2. **Line ~88**: Skips redirect useEffect when bypass enabled
3. **Line ~141**: Skips loading/unauthorized check when bypass enabled

---

## How to Use

### Access Dashboards

1. **Business Dashboard:**
   - Navigate to: `http://localhost:5173/dashboard`
   - No login required (bypass enabled)
   - Will show empty states (no data due to dummy user ID)

2. **Admin Dashboard:**
   - Navigate to: `http://localhost:5173/admin`
   - No login required (bypass enabled)
   - Will show empty states or errors (RLS may block queries)

### What You'll See

**Business Dashboard (`/dashboard`):**
- Full UI structure with tabs
- "Available Leads" tab - likely shows empty state
- "My Leads" tab - likely shows empty state
- Stats banner showing "0 Available" and "0 Unlocked"

**Admin Dashboard (`/admin`):**
- Full UI structure with stats cards
- Three tabs: Services & Pricing, All Leads, Businesses
- Stats may show zeros or errors (depends on RLS)

**Note:** Data queries may fail due to RLS policies, but you can still inspect the UI structure.

---

## How to Disable Bypass

### Option 1: Set Flag to False

In both files, change:
```typescript
const DEV_BYPASS_AUTH = false;
```

### Option 2: Remove DEV Code (Recommended Before Production)

**Dashboard.tsx:**
- Remove `DEV_BYPASS_AUTH` constant
- Remove conditional checks around `DEV_BYPASS_AUTH`
- Restore original logic

**Admin.tsx:**
- Remove `DEV_BYPASS_AUTH` constant
- Remove conditional checks around `DEV_BYPASS_AUTH`
- Change `enabled: DEV_BYPASS_AUTH || role === 'admin'` back to `enabled: role === 'admin'`
- Restore original logic

---

## Important Notes

### ⚠️ Data Queries

- **Business Dashboard:** Uses dummy user ID `'dev-dummy-user-id'`
  - `useBusinessLeads` will query but may return empty (no payments for dummy user)
  - `usePurchasedLeads` will query but return empty (no payments)
  - **RLS policies may block queries** - this is expected

- **Admin Dashboard:** Forces profiles query to enable
  - `useAdminLeads` will query (admin can see all leads via RLS)
  - Profiles query will run but may fail if RLS blocks
  - **Some queries may fail** - this is expected for visual inspection

### ✅ What Works

- ✅ Full UI structure visible
- ✅ All components render
- ✅ Tabs, cards, tables display
- ✅ Empty states show correctly
- ✅ Navigation works

### ❌ What Doesn't Work

- ❌ Real data (queries may fail due to RLS)
- ❌ Actions that require auth (purchasing leads, etc.)
- ❌ Any mutations (create/update/delete)

---

## Files Changed

1. `src/pages/Dashboard.tsx`
   - Added `DEV_BYPASS_AUTH` flag
   - Modified auth checks (3 locations)

2. `src/pages/Admin.tsx`
   - Added `DEV_BYPASS_AUTH` flag
   - Modified auth checks (3 locations)

---

## Reverting Changes

To restore original protection:

1. **Dashboard.tsx:**
   ```typescript
   // Remove DEV_BYPASS_AUTH constant
   // Change back to:
   const { data: availableLeads, isLoading: leadsLoading } = useBusinessLeads(user?.id);
   const { data: purchasedLeads, isLoading: purchasedLoading } = usePurchasedLeads(user?.id);
   
   // Restore useEffect:
   useEffect(() => {
     if (!authLoading && !user) {
       navigate('/login');
     }
     if (!authLoading && role === 'admin') {
       navigate('/admin');
     }
   }, [user, role, authLoading, navigate]);
   
   // Restore early return:
   if (authLoading || !user) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
   ```

2. **Admin.tsx:**
   ```typescript
   // Remove DEV_BYPASS_AUTH constant
   // Change back to:
   enabled: role === 'admin',
   
   // Restore useEffect:
   useEffect(() => {
     if (!authLoading && !user) {
       navigate('/login');
     }
     if (!authLoading && role !== 'admin') {
       navigate('/dashboard');
     }
   }, [user, role, authLoading, navigate]);
   
   // Restore early return:
   if (authLoading || !user || role !== 'admin') {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
   ```

---

## Summary

✅ **Bypass is active** - Both dashboards accessible without login  
✅ **Easy to disable** - Set `DEV_BYPASS_AUTH = false` or remove code  
✅ **No backend changes** - Only frontend routing logic modified  
⚠️ **Data may not load** - RLS policies still enforce security  
⚠️ **DEV ONLY** - Must be removed before production deployment

---

**Last Updated:** 2025-01-13  
**Status:** Active (DEV_BYPASS_AUTH = true)
