# RLS Policies for Guest Candidates

## Overview

This document describes the Row Level Security (RLS) policies implemented for users with role `candidate` and status `guest`.

## Implemented Restrictions

### 1. Creation Restrictions

Guest candidates **cannot** create:
- Applications (`applications` table)
- Reports (`reports` table)
- Complaints (`complaints` table)
- Support tickets (`support_tickets` table)

### 2. Read Access

Guest candidates **can** read:
- Their own user data
- All departments information
- All tests
- Their own notifications

Guest candidates **cannot** read:
- Other users' personal data
- Other users' applications, reports, complaints, or support tickets

### 3. Update Restrictions

Guest candidates **cannot**:
- Update any data, including their own profile

## Technical Implementation

### Policy Structure

The policies use a combination of role and status checks:

```sql
-- Example: Restriction for creating applications
CREATE POLICY "Non-guest users can create applications" ON "applications" 
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT auth_id FROM users WHERE id = author_id)
        AND NOT EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'candidate' 
            AND status = 'guest'
        )
    );
```

### Helper Function

A helper function `is_guest_candidate()` is provided to check if the current user is a guest candidate:

```sql
SELECT is_guest_candidate(); -- Returns TRUE if current user is a guest candidate
```

## Migration Files

- **Drizzle migration**: `migrations/002_rls_candidate_guest.sql`
- **Supabase migration**: `supabase/migrations/002_rls_candidate_guest_restrictions.sql`

## Testing

To test these policies:

1. Create a user with role `candidate` and status `guest`
2. Try to create an application - should fail
3. Try to read departments - should succeed
4. Try to read another user's data - should fail
5. Try to update own profile - should fail

## Security Considerations

- The policies ensure that guest candidates have minimal access to the system
- They can only consume public information, not create or modify data
- This prevents potential abuse by unverified or temporary users
- Admin users bypass all these restrictions
