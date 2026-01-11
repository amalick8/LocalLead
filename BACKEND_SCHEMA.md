# LocalLead Backend Schema Documentation

## Overview

This document describes the complete Supabase database schema for LocalLead, a lead marketplace platform where homeowners submit service requests and businesses purchase leads.

---

## Architecture

### User Types

1. **Anonymous (Homeowners)**
   - No authentication required
   - Can submit leads (service requests)
   - Cannot view any leads

2. **Business Users**
   - Authenticated via Supabase Auth
   - Can view available leads (status = 'new')
   - Can purchase leads to see full contact details
   - Can view their purchased leads

3. **Admin Users**
   - Authenticated via Supabase Auth
   - Full access to all data
   - Can manage services, users, and leads

---

## Database Schema

### Enums

```sql
-- User roles
app_role: 'business' | 'admin'

-- Contact preferences
contact_preference: 'phone' | 'email'

-- Lead status lifecycle
lead_status: 'new' | 'purchased' | 'expired'
```

### Tables

#### 1. `profiles`

User profile information linked to Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users | User ID from Supabase Auth |
| `email` | TEXT | NOT NULL | User email |
| `business_name` | TEXT | NULLABLE | Business name (for business users) |
| `phone` | TEXT | NULLABLE | User phone number |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**RLS Policies:**
- Users can SELECT/UPDATE their own profile
- Admins can SELECT all profiles

**Triggers:**
- Auto-created on user signup via `handle_new_user()`
- `updated_at` auto-updates on row changes

---

#### 2. `user_roles`

Role assignments for users. One role per user (default: business).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Role assignment ID |
| `user_id` | UUID | FK → auth.users, UNIQUE | User ID |
| `role` | app_role | NOT NULL | User role (business/admin) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Assignment timestamp |

**RLS Policies:**
- Users can SELECT their own roles
- Admins can manage all roles

**Triggers:**
- Auto-assigned 'business' role on signup via `handle_new_user()`

**Indexes:**
- `idx_user_roles_user_id` on `user_id` for fast role lookups

---

#### 3. `services`

Service categories available for lead submission.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Service ID |
| `name` | TEXT | NOT NULL, UNIQUE | Service name |
| `description` | TEXT | NULLABLE | Service description |
| `price_cents` | INTEGER | NOT NULL, DEFAULT 500 | Price per lead in cents |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether service is active |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**RLS Policies:**
- Anyone can SELECT active services (public read)
- Admins can manage all services

**Indexes:**
- `idx_services_is_active` on `is_active` WHERE `is_active = true` for fast active service queries

---

#### 4. `leads`

Service requests submitted by homeowners.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Lead ID |
| `service_id` | UUID | FK → services, NOT NULL | Service category |
| `name` | TEXT | NOT NULL | Homeowner name |
| `email` | TEXT | NULLABLE | Homeowner email |
| `phone` | TEXT | NULLABLE | Homeowner phone |
| `city` | TEXT | NOT NULL | Location city |
| `zip_code` | TEXT | NULLABLE | ZIP code |
| `description` | TEXT | NOT NULL | Project description |
| `contact_preference` | contact_preference | NOT NULL, DEFAULT 'email' | Preferred contact method |
| `status` | lead_status | NOT NULL, DEFAULT 'new' | Lead status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**RLS Policies:**
- **Anonymous**: Can INSERT leads (submit requests)
- **Business**: Can SELECT leads with `status = 'new'` (available leads)
- **Business**: Can SELECT leads they purchased (via payments)
- **Admin**: Can SELECT/UPDATE all leads

**Triggers:**
- `validate_lead_purchase()`: Prevents marking lead as 'purchased' without payment
- `updated_at` auto-updates on row changes

**Indexes:**
- `idx_leads_service_id` on `service_id` for service filtering
- `idx_leads_status` on `status` for status filtering
- `idx_leads_created_at` on `created_at DESC` for chronological ordering

**Security Note:**
- Business users receive all columns when querying available leads
- Frontend handles hiding email/phone until purchase
- For stricter security, consider a database view that excludes sensitive fields

---

#### 5. `payments`

Tracks lead purchases by businesses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Payment ID |
| `user_id` | UUID | FK → auth.users, NOT NULL | Business user who purchased |
| `lead_id` | UUID | FK → leads, NOT NULL | Lead that was purchased |
| `amount_cents` | INTEGER | NOT NULL | Amount paid in cents |
| `stripe_payment_intent_id` | TEXT | NULLABLE | Stripe payment intent ID |
| `status` | TEXT | NOT NULL, DEFAULT 'completed' | Payment status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Purchase timestamp |
| `user_id, lead_id` | - | UNIQUE | One payment per user per lead |

**RLS Policies:**
- Users can SELECT/INSERT their own payments
- Admins can SELECT all payments

**Indexes:**
- `idx_payments_user_id` on `user_id` for user payment queries
- `idx_payments_lead_id` on `lead_id` for lead purchase lookups
- `idx_payments_user_status` on `(user_id, status)` WHERE `status = 'completed'` for purchased leads

---

## Helper Functions

### `has_role(user_id, role)`

**Purpose:** Check if a user has a specific role. Used in RLS policies.

**Signature:**
```sql
has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN
```

**Security:** `SECURITY DEFINER` - runs with elevated privileges to check roles

**Usage:**
```sql
SELECT public.has_role(auth.uid(), 'admin');
```

---

### `handle_new_user()`

**Purpose:** Trigger function that creates profile and assigns role on user signup.

**Behavior:**
1. Extracts `business_name` from `raw_user_meta_data` if provided
2. Creates profile with email and business_name
3. Assigns 'business' role by default
4. Idempotent (handles conflicts gracefully)

**Trigger:** Fires `AFTER INSERT` on `auth.users`

---

### `validate_lead_purchase()`

**Purpose:** Ensures leads cannot be marked as 'purchased' without a completed payment.

**Behavior:**
- Validates when `status` changes from 'new' to 'purchased'
- Checks for existence of completed payment
- Raises exception if validation fails

**Trigger:** Fires `BEFORE UPDATE OF status` on `leads`

---

### `update_updated_at_column()`

**Purpose:** Generic trigger function to auto-update `updated_at` timestamps.

**Applied to:**
- `services`
- `profiles`
- `leads`

---

## Row Level Security (RLS) Summary

### Anonymous Users
- ✅ Can INSERT into `leads` (submit requests)
- ❌ Cannot SELECT anything

### Business Users
- ✅ Can SELECT own profile
- ✅ Can SELECT own roles
- ✅ Can SELECT active services
- ✅ Can SELECT available leads (`status = 'new'`)
- ✅ Can SELECT purchased leads (via payments)
- ✅ Can INSERT own payments
- ✅ Can SELECT own payments

### Admin Users
- ✅ Full access to all tables
- ✅ Can manage services
- ✅ Can manage user roles
- ✅ Can view all profiles, leads, and payments

---

## Data Flow

### Lead Submission (Anonymous)
1. Homeowner fills form on landing page
2. Frontend calls `supabase.from('leads').insert(...)`
3. RLS allows INSERT (anyone can create)
4. Lead created with `status = 'new'`

### Lead Purchase (Business)
1. Business user views available leads
2. User clicks "Purchase Lead"
3. Frontend creates payment record
4. Frontend updates lead status to 'purchased'
5. Trigger validates payment exists
6. Business can now see full contact details

### User Signup (Business)
1. User submits signup form with email, password, business_name
2. Frontend calls `supabase.auth.signUp()` with metadata
3. Supabase Auth creates user
4. `handle_new_user()` trigger fires:
   - Creates profile with email and business_name
   - Assigns 'business' role
5. User can now access dashboard

---

## Performance Considerations

### Indexes

All critical query paths are indexed:

- **Role lookups:** `idx_user_roles_user_id`
- **Active services:** `idx_services_is_active`
- **Lead filtering:** `idx_leads_service_id`, `idx_leads_status`, `idx_leads_created_at`
- **Payment queries:** `idx_payments_user_id`, `idx_payments_lead_id`, `idx_payments_user_status`

### Query Patterns

**Business Dashboard (Available Leads):**
```sql
SELECT * FROM leads 
WHERE status = 'new' 
ORDER BY created_at DESC;
-- Uses: idx_leads_status, idx_leads_created_at
```

**Business Dashboard (Purchased Leads):**
```sql
SELECT l.* FROM leads l
INNER JOIN payments p ON l.id = p.lead_id
WHERE p.user_id = $1 AND p.status = 'completed'
ORDER BY l.created_at DESC;
-- Uses: idx_payments_user_status, idx_leads_created_at
```

---

## Security Best Practices

1. **RLS Enabled:** All tables have RLS enabled
2. **Security Definers:** Helper functions use `SECURITY DEFINER` appropriately
3. **No Service Role in Frontend:** Frontend only uses `anon` key
4. **Role-Based Access:** All access controlled via `has_role()` function
5. **Payment Validation:** Leads cannot be marked purchased without payment
6. **Idempotent Triggers:** Signup trigger handles edge cases gracefully

---

## Migration Strategy

### For New Supabase Project

1. Run the migration: `supabase migration up`
2. Verify tables created: Check Supabase dashboard
3. Test RLS: Try queries as different user types
4. Seed services: Default services are inserted automatically

### For Existing Project

If you have existing data:

1. **Backup first:** Export all data
2. **Review conflicts:** Check for table/enum name conflicts
3. **Run migration:** Apply schema changes
4. **Verify:** Test all RLS policies
5. **Migrate data:** If needed, migrate existing data to new schema

---

## Environment Variables

Required Supabase environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Never expose the service role key in frontend code.**

---

## Testing Checklist

- [ ] Anonymous user can create lead
- [ ] Anonymous user cannot read leads
- [ ] Business user can see available leads
- [ ] Business user can purchase lead
- [ ] Business user can see purchased leads
- [ ] Admin can see all leads
- [ ] Admin can manage services
- [ ] User signup creates profile and role
- [ ] Lead cannot be marked purchased without payment
- [ ] Timestamps auto-update correctly

---

## Future Enhancements

Potential improvements (not in current schema):

1. **Lead Expiration:** Auto-expire leads after X days
2. **Stripe Integration:** Real payment processing
3. **Lead Views:** Track which businesses viewed which leads
4. **Service Areas:** Geographic filtering for businesses
5. **Lead Scoring:** Quality scoring for leads
6. **Notifications:** Email/SMS notifications for new leads

---

## Support

For questions or issues:
- Review RLS policies in Supabase dashboard
- Check trigger logs for errors
- Verify role assignments in `user_roles` table
- Test queries with different user contexts

---

**Last Updated:** 2025-01-13
**Schema Version:** 1.0.0
