# 🚀 LocalLead

**LocalLead** is a secure, role-based lead marketplace that connects consumers with local service providers through **verified, purchasable leads**.

Built with a **backend-first, security-first** mindset using Supabase, Postgres, and Row Level Security (RLS), LocalLead is designed to scale from MVP to production without rewriting core logic.

> This project intentionally prioritizes **data integrity, access control, and real-world monetization** over flashy demos.

---

## 🧠 Concept

1. Consumers submit service requests (leads)
2. Businesses purchase access to those leads
3. Admins manage services, roles, and platform oversight

### Key Principles
- 🔒 Zero-trust by default
- 🧱 Database-enforced permissions (no frontend-only security)
- 💳 Atomic, auditable purchases
- 📈 Built to scale from day one

---

## 🏗️ Architecture

### Tech Stack
- **Backend / Database:** Supabase (Postgres)
- **Authentication:** Supabase Auth
- **Authorization:** Postgres Row Level Security (RLS)
- **Payments:** Stripe (integration-ready)
- **Frontend:** Web client (role-aware UI)
- **Infra Philosophy:** Database is the source of truth

---

## 🔐 Security Model

LocalLead enforces access control **at the database level**, not in application logic.

### Roles
- `business` — default role for new users
- `admin` — platform administrators

### Enforcement
- All tables have RLS enabled
- Policies restrict access by:
  - Authenticated user ID
  - User role
  - Payment status
- Unauthorized access is blocked even if the frontend is bypassed

---

## 🗄️ Data Model

### Core Tables
- `services` — available service categories
- `leads` — consumer-submitted requests
- `profiles` — business user profiles
- `user_roles` — role management (`business`, `admin`)
- `payments` — lead purchase records

### Key Relationships
- A lead belongs to a service
- A business can purchase a lead once
- Purchased leads are visible **only** to the buyer
- Admins can view and manage everything

---

## 💳 Payments (Design)

The system is designed for Stripe-based payments with full auditability.

### Purchase Flow (Planned)
1. Business initiates purchase
2. Stripe Checkout creates payment intent
3. Webhook marks payment as `completed`
4. Lead becomes visible to the purchaser
5. Lead status updates to `purchased`

> Payment logic is designed to be **atomic and race-condition safe**.

---

## 🧩 Authentication Flow

- User signs up via Supabase Auth
- Database trigger automatically:
  - Creates a `profiles` row
  - Assigns the `business` role
- No manual setup required

---

## 🔁 Automation & Triggers

- `updated_at` timestamps are auto-maintained via triggers
- New users are initialized via database triggers
- Role checks are handled through a `SECURITY DEFINER` function

---

## 📊 Current Status

| Component | Status |
|---------|-------|
| Database Schema | ✅ Complete |
| RLS Policies | ✅ Complete |
| Auth & Roles | ✅ Complete |
| Lead Ingestion | ✅ Complete |
| Payments (Stripe) | ⚠️ In Progress |
| Frontend Wiring | ⚠️ In Progress |
| Admin Dashboard | ⏳ Planned |

---

## 🚀 Why This Project Matters

Most projects:
- Trust the frontend
- Skip RLS
- Break under real users

LocalLead:
- Treats the database as the authority
- Enforces security at the lowest level
- Is safe by default, not by convention

This is **production-grade architecture**, not a demo.

---

## 🛠️ Running Locally

```bash
supabase start
supabase db push
