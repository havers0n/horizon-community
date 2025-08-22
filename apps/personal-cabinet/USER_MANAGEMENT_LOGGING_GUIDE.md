# User Management Logging Diagnostic Guide

## ⚠️ TEMPORARY CHANGES: user.roles Unavailable

**Status**: The `user.roles` field is temporarily unavailable from the RPC response.

**Changes Made**:
1. **UserWithRoles Interface**: Commented out `roles: Role[]` field
2. **UserTable Component**: 
   - Commented out roles column rendering
   - Commented out manage user button 
   - Added placeholder "Роли временно недоступны" badge
3. **Admin Users Page**: 
   - Commented out ManageUserRolesModal
   - Modified handleManageUser to just log instead of opening modal

**Visual Changes**:
- Roles column shows "Роли временно недоступны" instead of actual roles
- Actions column shows "Недоступно" instead of manage button
- Role management modal is disabled

## ✅ FIXED: Rules of Hooks Issue

**Issue**: React Hook order violation causing "Rendered more hooks than during the previous render" error.

**Root Cause**: useEffect hooks were placed after conditional returns (if statements), violating React's Rules of Hooks.

**Solution**: Moved all hooks to the top of the component before any conditional returns, ensuring consistent hook order on every render.

## Added Extended Logging

The following extended logging has been added to diagnose empty results from the `get_users_with_roles` RPC function:

### 1. API Service Logging (`src/shared/api/user-management.ts`)

**Before RPC call:**
```
%c[UserManagement API] Calling RPC: get_users_with_roles (blue, bold)
```
Logs: parameters, original params, page, page_limit, search_query

**After RPC call:**
```
%c[UserManagement API] RAW Response from RPC: (blue, bold)
```
Logs: raw data, error, data type, data length, users property check

**Final result:**
```
%c[UserManagement API] Final processed result: (green, bold)
```
Logs: final processed response structure

### 2. UserTable Component Logging (`src/widgets/user-table/ui/UserTable.tsx`)

**Component mount:**
```
%c[UserTable] Component mounted/updated: (magenta, bold)
```
Logs: search query, debounced query, current page, page limit, props

**Query conditions:**
```
%c[UserTable] Query conditions changed: (orange, bold)
```
Logs: current page, page limit, search queries, query trigger status

**Query function trigger:**
```
%c[UserTable] useQuery queryFn triggered (purple, bold)
```
Logs: parameters about to be passed to API

**Query result:**
```
%c[UserTable] useQuery result received: (green, bold)
```
Logs: result data, user count, total count

**Data processing:**
```
%c[UserTable] Data processing: (cyan, bold)
```
Logs: raw data, processed users, lengths, pagination info, loading/error states

**Query success:**
```
%c[UserTable] Query SUCCESS - Data received: (green, bold)
```

**Query error:**
```
%c[UserTable] Query ERROR: (red, bold)
```

### 3. Admin Page Logging (`src/pages/admin/users/index.tsx`)

**Component mount:**
```
%c[AdminUsersPage] Component mounted: (red, bold)
```
Logs: component state and successful render confirmation

## Testing Steps

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Navigate to** `/admin/users` in the application
4. **Observe the console output** for the colored logging messages

## What to Look For

### Expected Flow:
1. `[AdminUsersPage] Component mounted` - Page renders
2. `[UserTable] Component mounted/updated` - Table component initializes
3. `[UserTable] Query conditions changed` - Parameters set
4. `[UserTable] useQuery queryFn triggered` - Query starts
5. `[UserManagement API] Calling RPC` - API call begins
6. `[UserManagement API] RAW Response from RPC` - Raw response received
7. `[UserManagement API] Final processed result` - Processed response
8. `[UserTable] useQuery result received` - Result back to component
9. `[UserTable] Query SUCCESS` - Query completed successfully
10. `[UserTable] Data processing` - Final data processing

### Diagnostic Questions:

**If no users show:**
- Does the RPC call succeed? (Check step 6)
- Is `data` null/undefined? (Check step 7)
- Does `data.users` exist? (Check step 7 - "hasUsers" field)
- Is `result.users` an empty array? (Check step 8)

**If RPC fails:**
- What's the error message? (Check step 6 - "error" field)
- Are the parameters correct? (Check step 5)
- Does user have proper permissions?

**If component doesn't mount:**
- Does `[AdminUsersPage] Component mounted` appear?
- Is there a PermissionGuard blocking access?

## Common Issues to Check:

1. **Empty RPC Response**: `data` is null/empty object
2. **Wrong Data Structure**: `data.users` doesn't exist
3. **Permission Issues**: RPC returns permission denied
4. **Parameter Issues**: Wrong page/limit/search values
5. **Database Issues**: RPC function doesn't exist or has errors

## Additional Debugging

If needed, you can also check:
- Network tab for actual HTTP requests to Supabase
- Application tab for authentication tokens
- Console errors for permission or authentication issues