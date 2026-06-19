---
name: Notification wiring
description: How cross-role notifications are sent to students
---

Student notifications live in `artifacts/campusflow/src/lib/student-store.ts` → `notificationStore`.

**Sending to a specific student:** `notificationStore.add({ userId: issue.studentId, type, title, message, link })`

**Broadcast pattern:** `userId: 'broadcast'` — used for new events/notices where all students should see it. The NotificationContext reads all notifications and filters by userId === user.id OR userId === 'broadcast'.

**Notification types defined in student-store.ts:** issue_assigned, status_changed, issue_resolved, sos_update, new_notice, lost_found_match, booking_approved, booking_rejected, new_event.

**When notifications fire:**
- Complaint status change → status_changed or issue_resolved (in complaints.tsx)
- Booking approved/rejected → booking_approved / booking_rejected (in booking-manage.tsx)
- New event published → new_event broadcast (in events.tsx)
- New notice published → new_notice broadcast (in notices.tsx)
- Booking request submitted → booking_approved notification to self as confirmation (in student-booking.tsx)
