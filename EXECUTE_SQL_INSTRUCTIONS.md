# Execute SQL Commands on Supabase

## Project Details
- **Project Ref:** xekjxblesgdrnqaxpjwx
- **Project URL:** https://supabase.com/dashboard/project/xekjxblesgdrnqaxpjwx

## Status: MCP Supabase Tools Not Available

Unfortunately, MCP Supabase tools are not available in this environment. However, all SQL migrations have already been created and are ready to execute.

## Option 1: Execute via Supabase Dashboard (RECOMMENDED)

This is the simplest and most reliable method:

### Steps:

1. Go to the Supabase SQL Editor:
   https://supabase.com/dashboard/project/xekjxblesgdrnqaxpjwx/sql/new

2. Open the migration file:
   `supabase/migrations/001_initial_schema.sql`

3. Copy the entire contents of the file

4. Paste it into the SQL Editor

5. Click "Run" or press Ctrl+Enter

6. Check for success message: "Schema created successfully!"

### What this will create:

- **Tables:**
  - `plans` - Subscription plans
  - `users` - User profiles (extends auth.users)
  - `templates` - Document templates
  - `documents` - Generated documents
  - `payments` - Payment records
  - `document_sends` - Document delivery tracking
  - `document_shares` - Share links
  - `audit_logs` - System audit trail

- **Seed Data:**
  - 4 subscription plans (Free, Basic, Pro, Enterprise)
  - 4 public templates (Contract, Receipt, Budget, Terms)

- **Triggers & Functions:**
  - `update_updated_at()` - Auto-update timestamps
  - `handle_new_user()` - Auto-create user profile on signup

- **Indexes:** Performance indexes on frequently queried columns

## Option 2: Execute via Management API

If you have a Supabase access token:

1. Get your access token from:
   https://supabase.com/dashboard/account/tokens

2. Run the migration script:
   ```bash
   set SUPABASE_ACCESS_TOKEN=your_token_here
   node scripts/run-sql-migrations.mjs
   ```

## Option 3: Install Supabase CLI

1. Install the CLI:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref xekjxblesgdrnqaxpjwx
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

## Verification

After executing the SQL, you can verify the setup by running:

```bash
node scripts/setup-database.mjs
```

This will check:
- Connection to Supabase
- Tables existence
- Seed data (plans and templates count)
- Storage bucket configuration

## Files Created

1. `supabase/migrations/001_initial_schema.sql` - Complete database schema (ALREADY EXISTS)
2. `scripts/run-sql-migrations.mjs` - Management API execution script (NEW)
3. `scripts/execute-sql.mjs` - Alternative execution script (NEW)
4. `scripts/setup-database.mjs` - Verification script (ALREADY EXISTS)

## Result Summary

All SQL commands from your request are included in the existing migration file:
- `supabase/migrations/001_initial_schema.sql`

The file contains:
- All 8 table CREATE statements
- All seed data (plans)
- Plus additional features (indexes, triggers, sample templates)

**Next Step:** Execute the SQL file via the Supabase Dashboard (Option 1 above)
