# LocalLead Setup Guide

## Quick Start

### 1. Environment Variables

Create a `.env` file in the project root with:

```bash
VITE_SUPABASE_URL=https://txjepqarsckyawlsfbxg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_taq5yneBLC74vqIgNkB3bg_ANKJSkAO
```

**Important:** The `.env` file is gitignored. Never commit it.

### 2. Database Setup

The backend schema is defined in:
- `supabase/migrations/20250113000000_initial_schema.sql`

To apply the schema to your Supabase project:

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Copy the contents of `20250113000000_initial_schema.sql`
   - Run the SQL

2. **Via Supabase CLI (if installed):**
   ```bash
   supabase db push
   ```

### 3. Start Development Server

```bash
npm install
npm run dev
```

The app should now load without errors.

---

## Troubleshooting

### Black Screen / "supabaseKey is required"

**Cause:** Missing environment variables

**Fix:**
1. Create `.env` file in project root
2. Add the variables listed above
3. Restart the dev server (`npm run dev`)

### Database Connection Errors

**Cause:** Schema not applied to Supabase project

**Fix:**
1. Apply the migration SQL to your Supabase project
2. Verify tables exist in Supabase dashboard
3. Check RLS policies are enabled

### Auth Errors

**Cause:** User roles not assigned

**Fix:**
1. Check `user_roles` table has entries
2. Verify `handle_new_user()` trigger exists
3. Check trigger logs in Supabase dashboard

---

## Project Structure

```
local-lead-hub/
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── hooks/             # React Query hooks
│   ├── lib/               # Auth & utilities
│   └── integrations/
│       └── supabase/      # Supabase client & types
├── supabase/
│   └── migrations/        # Database migrations
└── .env                   # Environment variables (gitignored)
```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Yes |

---

## Database Schema

See `BACKEND_SCHEMA.md` for complete database documentation.

**Key Tables:**
- `profiles` - User profiles
- `user_roles` - Role assignments
- `services` - Service categories
- `leads` - Service requests
- `payments` - Lead purchases

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify `.env` file exists and has correct values
3. Verify database schema is applied
4. Check Supabase dashboard for connection status
