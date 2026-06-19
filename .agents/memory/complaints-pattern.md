---
name: Complaint management pattern
description: How the shared /complaints page works across roles
---

Single page `artifacts/campusflow/src/pages/complaints.tsx` handles complaints for all staff roles.

**Role behavior:**
- admin: sees all issues, can assign staff (from campusUserStore.getStaff()), update any status, upload after photo, add resolution notes
- faculty: sees all issues, can update status + add notes  
- maintenance: sees ONLY issues where `issue.assignedTo?.name === user.name` (name-based match, not ID)
- student: redirected away (useEffect redirect to /dashboard/student)

**Why name-based assignment:** The campus user store has local IDs that don't match API server JWTs. Matching by name is pragmatic for this demo size.

**On save:** If status changed, notificationStore.add() is called with issue.studentId so the student gets notified. If assignee set but status was Submitted, auto-promotes to Assigned.

**Staff dropdown:** Populated from campusUserStore.getStaff() filtered to isActive=true.
