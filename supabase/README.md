# Supabase Configuration

## Overview

This directory contains all Supabase-related configuration and migrations for the Mr. Rent platform.

## Migrations

### `001_enable_rls_policies.sql`

Defines Row-Level Security (RLS) policies for:
- **affiliates** - Affiliate program user data
- **affiliate_commissions** - Commission tracking
- **Feedback** - User feedback

## RLS Security Model

### Access Levels

| Role | Access | Purpose |
|------|--------|---------|
| `authenticated` | Own data only | User accessing their profile |
| `admin` | All data (read) | Moderation & oversight |
| `service_role` | All data (full) | Backend APIs & automation |
| `anon` | None | Disabled by default |

### Table Policies

#### Affiliates
- **INSERT**: Users can create only their own record
- **SELECT**: Users see own data; admins see all
- **UPDATE**: Users can update only their own data
- **service_role**: Full access for backend

#### Affiliate Commissions
- **SELECT**: Affiliates see own commissions; admins see all
- **service_role**: Full access for payment processing

#### Feedback
- **INSERT/UPDATE/DELETE**: Users manage own feedback
- **SELECT**: Users see own; admins see all
- **service_role**: Full access

## How to Apply

### First Time Setup

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy-paste contents of `001_enable_rls_policies.sql`
4. Click **Run**

### Updating Policies

If you need to modify a policy:

```sql
-- Drop the old policy
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Create the new one
CREATE POLICY "policy_name" ...
```

## Best Practices

1. **Always test RLS**: Create test users and verify they can't access others' data
2. **Document changes**: Add comments to migration files
3. **Version control**: Keep migrations in git
4. **Review before deploy**: Ensure policies match your security model

## Security Checklist

- [ ] All tables have RLS enabled
- [ ] No anonymous access allowed
- [ ] User data is isolated via `auth.uid()`
- [ ] Admin role has necessary access
- [ ] Service role configured for backend
- [ ] Policies tested with multiple users
- [ ] Sensitive columns reviewed

## Common Issues

### "new row violates row-level security policy"

**Cause**: Attempting to insert/update a row that doesn't match the policy's WITH CHECK condition.

**Fix**: Ensure `auth.uid()` matches the user ID being inserted.

### "You must enable RLS to use these policies"

**Cause**: Trying to create policies without enabling RLS first.

**Fix**: Run `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

### Service role APIs returning no data

**Cause**: Missing `service_role` policy.

**Fix**: Add policy with `TO service_role USING (true)`

## Resources

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createpolicy.html)

---

**Last updated**: 2026-09-19
