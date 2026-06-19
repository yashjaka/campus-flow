---
name: Campus store architecture
description: How shared campus data is stored and seeded across roles
---

All shared campus data lives in `artifacts/campusflow/src/lib/campus-store.ts` using localStorage.

**Types:** CampusUser, Booking, CampusEvent, Notice, Survey (with SurveyQuestion, SurveyResponse)

**Stores:** campusUserStore, bookingStore, eventStore, noticeStore, surveyStore

**Seeding:** `initCampusStore()` must be called once at app startup (done in App.tsx). Uses one-time flags (e.g. `cf_campus_users_init`) to prevent re-seeding on reload.

**Why:** User requested localStorage-only for all new features; auth still goes through API server JWT.

**How to apply:** Import from `@/lib/campus-store` in any page. Never store credentials or tokens here.

**Demo users seeded:** admin (cu-admin-1), Dr. Sarah Mitchell (cu-fac-1, faculty), Prof. James Carter (cu-fac-2, faculty), Carlos Rivera (cu-mnt-1, maintenance), 5 students (cu-std-1 through cu-std-5).

**Booking double-booking prevention:** `bookingStore.isSlotTaken(resource, date, timeSlot)` — checks for any Approved booking on same resource+date+slot.
