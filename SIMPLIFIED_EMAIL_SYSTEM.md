# Simplified Email & Assignment System 📧

## Overview
Replaced complex escalation system with a simple technician assignment system.

## Database Schema

### 1. technicians table
```sql
- id (UUID, primary key)
- name (text, required) 
- email (text, optional)
- phone (text, optional)  
- is_active (boolean, default true)
- created_at, updated_at (timestamps)
```

### 2. booking_assignments table
```sql
- id (UUID, primary key)
- order_id (UUID, foreign key to orders)
- technician_id (UUID, foreign key to technicians, nullable)
- assignment_token (UUID, unique token for assignment links)
- assigned_at (timestamp, when technician was assigned)
- assigned_by (text, name of person who assigned)
- status (enum: 'pending', 'assigned', 'completed')
- notes (text, optional)
- created_at, updated_at (timestamps)
```

## Email Flow 🔄

1. **Booking Created** → Create `booking_assignments` record with unique token
2. **Internal Email Sent** to `apoorvpath@gmail.com` with two links:
   - **Assignment Link**: `/assign-booking/{assignment_token}`
   - **Dashboard Link**: `/booking-dashboard`
3. **External Email Sent** to customer's email:
   - **Booking Confirmation**: `/booking-confirmation/{booking_id}`
   - **Assignment Confirmation**: `/assignment-confirmation/{assignment_token}` (when lab technician is assigned)

## New Pages to Build 📄

### 1. ✅ Assignment Page (`/assign-booking/[token]`)
- Verifies token is valid and booking not already assigned
- Dropdown to select technician from `technicians` table  
- Input field for "assigned by" name
- Submit button to assign technician
- Success/error messaging

### 2. ✅ Dashboard Page (`/booking-dashboard`) 
- Shows all bookings from last 48 hours
- Color coding for status: Pending, Assigned, Completed
- Filters: All, Pending, Assigned, Completed
- Search by order number or customer name
- Quick assign functionality via a dialog

## Functions to Update 🔧

### 1. ✅ Simplified `send-booking-email` function
- Remove escalation logic
- Change recipient to `apoorvpath@gmail.com`
- Generate assignment token
- Create simple email template with two buttons

### 2. Helper function (already created)
```sql
assign_technician_to_booking(token, technician_id, assigned_by)
```

## Files Removed 🗑️
- ✅ Complex email escalation tables
- ✅ `emailNotificationService.ts` 
- ✅ `process-escalations` edge function
- ✅ `verify-email` edge function
- ✅ Old documentation files
- ✅ Deployment scripts for removed functions

## Benefits of New System ✨

1. **Simpler**: No complex escalation logic
2. **Visual**: Dashboard shows status at a glance  
3. **Flexible**: Easy to add/remove technicians
4. **Trackable**: Know who assigned what and when
5. **Reliable**: No timed escalations that could fail

## Security: Role-Based Access Control (RBAC) 🛡️

To prevent unauthorized access to admin pages (`/booking-dashboard`), a role-based access control system has been implemented. The `/assign-booking/*` route is secured by a unique token.

1.  **User Roles**:
    *   A `role` column was added to the `profiles` table.
    *   Default role for new users is `customer`.
    *   Admin users can be assigned the `admin` role manually in the Supabase dashboard.

2.  **Protected Routes**:
    *   A new `AdminLayout` component wraps administrative routes like the dashboard.
    *   It checks if the logged-in user has the `admin` role.
    *   If the user is not an admin, they are redirected to a "Not Found" page.
    *   The `/assign-booking/:token` route is publicly accessible but secured by the unique `token` in the URL, which acts as a one-time access key.

3.  **Implementation Details**:
    *   **Migration**: `supabase/migrations/20250830000002_add_role_to_profiles.sql`
    *   **Auth Hook**: `src/hooks/useAuth.tsx` was updated to fetch the user's role.
    *   **Layout Component**: `src/layouts/AdminLayout.tsx` contains the access control logic.
    *   **Routing**: `src/App.tsx` was updated to use the `AdminLayout` for protected routes.
