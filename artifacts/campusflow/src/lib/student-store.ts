export type IssueStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SosType = 'Medical Emergency' | 'Fire' | 'Security Threat' | 'Electrical Hazard' | 'Other';
export type LostFoundStatus = 'Reported' | 'Matched' | 'Claimed';
export type NotificationType =
  | 'issue_assigned' | 'status_changed' | 'issue_resolved' | 'sos_update'
  | 'new_notice' | 'lost_found_match' | 'booking_approved' | 'booking_rejected' | 'new_event';

export interface Issue {
  id: string; studentId: string; studentName: string;
  title: string; description: string; location: string;
  category: string; priority: IssuePriority; department: string;
  photoBase64?: string; afterPhotoBase64?: string; resolutionNotes?: string;
  assignedTo?: { id: string; name: string; role: string };
  status: IssueStatus;
  statusHistory: Array<{ status: IssueStatus; timestamp: string; note?: string }>;
  rating?: { stars: number; comment: string };
  createdAt: string; updatedAt: string;
}
export interface SosAlert {
  id: string; studentId: string; studentName: string; type: SosType;
  description: string; location: string; status: 'Active' | 'Acknowledged' | 'Resolved';
  createdAt: string;
}
export interface LostFoundItem {
  id: string; reportType: 'lost' | 'found'; studentId: string; studentName: string;
  itemName: string; description: string; photoBase64?: string; location: string;
  date: string; status: LostFoundStatus; createdAt: string;
}
export interface AppNotification {
  id: string; userId: string; type: NotificationType;
  title: string; message: string; read: boolean; createdAt: string; link?: string;
}

function uid(): string { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function ls<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function ls_set(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }

const KEYS = { issues: 'cf_issues', sos: 'cf_sos', lostFound: 'cf_lost_found', notifications: 'cf_notifications' };

// ── Seed Data ──────────────────────────────────────────────────────────────
const SEED_ISSUES: Issue[] = [
  { id: 'iss-001', studentId: 'cu-std-1', studentName: 'Priya Sharma', title: 'Water Leakage Near CE Lab 102 Server Rack', description: 'Severe water leakage from ceiling near the server rack in CE Lab 102. High risk of electrical damage and data loss.', location: 'Computer Engineering Building, Lab 102', category: 'Plumbing', priority: 'High', department: 'Maintenance', status: 'Resolved', assignedTo: { id: 'cu-mnt-1', name: 'Carlos Rivera', role: 'maintenance' }, resolutionNotes: 'Overhead pipe replaced. Ceiling patched and waterproofed. Server rack inspected – no damage found.', rating: { stars: 4, comment: 'Quick response, handled well. Minor delay in starting.' }, statusHistory: [{ status: 'Submitted', timestamp: '2026-01-15T09:00:00Z' }, { status: 'Assigned', timestamp: '2026-01-15T11:30:00Z' }, { status: 'In Progress', timestamp: '2026-01-16T08:00:00Z' }, { status: 'Resolved', timestamp: '2026-01-17T16:00:00Z' }], createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-01-17T16:00:00Z' },
  { id: 'iss-002', studentId: 'cu-std-2', studentName: 'Arjun Verma', title: 'Projector Malfunction – IT Seminar Hall', description: 'The projector in the IT Seminar Hall has been displaying distorted colors and flickering. Disrupting all presentations and classes.', location: 'IT Building, Seminar Hall 201', category: 'IT Support', priority: 'Medium', department: 'IT Department', status: 'Resolved', assignedTo: { id: 'cu-fac-1', name: 'Dr. Sarah Mitchell', role: 'faculty' }, resolutionNotes: 'Projector lamp replaced. HDMI cable and display settings reconfigured. Now working perfectly.', rating: { stars: 5, comment: 'Excellent! Fixed the same day. Very professional.' }, statusHistory: [{ status: 'Submitted', timestamp: '2026-01-28T10:00:00Z' }, { status: 'Under Review', timestamp: '2026-01-28T11:00:00Z' }, { status: 'Assigned', timestamp: '2026-01-28T12:00:00Z' }, { status: 'Resolved', timestamp: '2026-01-28T17:00:00Z' }], createdAt: '2026-01-28T10:00:00Z', updatedAt: '2026-01-28T17:00:00Z' },
  { id: 'iss-003', studentId: 'cu-std-3', studentName: 'Meera Nair', title: 'Broken Chairs and Tables – ME Workshop Room', description: '6 chairs and 2 tables in the ME Workshop are broken, posing safety hazards. Students are sitting on floor during practical sessions.', location: 'Mechanical Engineering Building, Workshop Room 301', category: 'Furniture', priority: 'Low', department: 'Housekeeping', status: 'Under Review', statusHistory: [{ status: 'Submitted', timestamp: '2026-02-10T09:00:00Z' }, { status: 'Under Review', timestamp: '2026-02-11T10:00:00Z' }], createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-11T10:00:00Z' },
  { id: 'iss-004', studentId: 'cu-std-4', studentName: 'Rahul Singh', title: 'Complete Network Outage – CIVIL CAD Lab', description: 'All 30 computers in the CIVIL CAD Lab have lost network connectivity since this morning. AutoCAD license server is unreachable. Design submissions are at risk.', location: 'Civil Engineering Building, CAD Lab 105', category: 'IT Support', priority: 'High', department: 'IT Department', status: 'In Progress', assignedTo: { id: 'cu-fac-1', name: 'Dr. Sarah Mitchell', role: 'faculty' }, statusHistory: [{ status: 'Submitted', timestamp: '2026-02-20T08:30:00Z' }, { status: 'Assigned', timestamp: '2026-02-20T10:00:00Z' }, { status: 'In Progress', timestamp: '2026-02-21T09:00:00Z' }], createdAt: '2026-02-20T08:30:00Z', updatedAt: '2026-02-21T09:00:00Z' },
  { id: 'iss-005', studentId: 'cu-std-5', studentName: 'Ananya Bose', title: 'AC System Failure – Electrical Engineering Control Lab', description: 'Air conditioning system in EE Control Lab has completely failed. Temperature is 38°C+, making it impossible to conduct sensitive equipment experiments. Equipment may overheat.', location: 'Electrical Engineering Building, Control Lab 402', category: 'Electrical', priority: 'Critical', department: 'Electrical', status: 'Assigned', assignedTo: { id: 'cu-mnt-1', name: 'Carlos Rivera', role: 'maintenance' }, statusHistory: [{ status: 'Submitted', timestamp: '2026-03-05T07:00:00Z' }, { status: 'Under Review', timestamp: '2026-03-05T08:00:00Z' }, { status: 'Assigned', timestamp: '2026-03-05T09:30:00Z' }], createdAt: '2026-03-05T07:00:00Z', updatedAt: '2026-03-05T09:30:00Z' },
  { id: 'iss-006', studentId: 'cu-std-1', studentName: 'Priya Sharma', title: 'Cafeteria Food Quality – Hygiene Concerns', description: 'Multiple students fell ill after eating from the college cafeteria. Food is not fresh and hygiene standards are not being maintained. The cooking area appears unclean.', location: 'Main Campus Cafeteria', category: 'General', priority: 'Medium', department: 'Administration', status: 'Submitted', statusHistory: [{ status: 'Submitted', timestamp: '2026-03-22T13:00:00Z' }], createdAt: '2026-03-22T13:00:00Z', updatedAt: '2026-03-22T13:00:00Z' },
  { id: 'iss-007', studentId: 'cu-std-2', studentName: 'Arjun Verma', title: 'Library Reading Room – Poor Sanitation & Odour', description: 'The library reading room has a persistent unpleasant odour. Dustbins are overflowing and cleaning is not done regularly. Making it very uncomfortable for students during exam preparation.', location: 'Central Library, Reading Room 1', category: 'Sanitation', priority: 'Low', department: 'Housekeeping', status: 'Resolved', resolutionNotes: 'Deep cleaning conducted. Additional dustbins installed. Daily cleaning schedule enforced with supervisor sign-off.', rating: { stars: 5, comment: 'Amazing improvement! Library is now spotless. Thank you!' }, statusHistory: [{ status: 'Submitted', timestamp: '2026-04-08T11:00:00Z' }, { status: 'Assigned', timestamp: '2026-04-09T09:00:00Z' }, { status: 'In Progress', timestamp: '2026-04-09T14:00:00Z' }, { status: 'Resolved', timestamp: '2026-04-10T10:00:00Z' }], createdAt: '2026-04-08T11:00:00Z', updatedAt: '2026-04-10T10:00:00Z' },
  { id: 'iss-008', studentId: 'cu-std-3', studentName: 'Meera Nair', title: 'Sports Ground Floodlights Not Working', description: '8 out of 12 floodlights on the sports ground have stopped working. Students cannot practice after sunset. Inter-college cricket match is scheduled in 2 weeks.', location: 'Main Sports Ground', category: 'Electrical', priority: 'Medium', department: 'Electrical', status: 'In Progress', assignedTo: { id: 'cu-mnt-1', name: 'Carlos Rivera', role: 'maintenance' }, statusHistory: [{ status: 'Submitted', timestamp: '2026-04-19T18:00:00Z' }, { status: 'Assigned', timestamp: '2026-04-20T10:00:00Z' }, { status: 'In Progress', timestamp: '2026-04-22T08:00:00Z' }], createdAt: '2026-04-19T18:00:00Z', updatedAt: '2026-04-22T08:00:00Z' },
  { id: 'iss-009', studentId: 'cu-std-4', studentName: 'Rahul Singh', title: 'CE Computer Lab B – 5 Workstations Non-Functional', description: '5 computers in CE Computer Lab B have hardware failures (3 PSU failures, 2 monitor issues). With semester exams approaching, students cannot complete practicals.', location: 'Computer Engineering Building, Computer Lab B', category: 'IT Support', priority: 'High', department: 'IT Department', status: 'In Progress', assignedTo: { id: 'cu-fac-2', name: 'Prof. James Carter', role: 'faculty' }, statusHistory: [{ status: 'Submitted', timestamp: '2026-05-12T09:00:00Z' }, { status: 'Under Review', timestamp: '2026-05-12T11:00:00Z' }, { status: 'Assigned', timestamp: '2026-05-13T09:00:00Z' }, { status: 'In Progress', timestamp: '2026-05-14T10:00:00Z' }], createdAt: '2026-05-12T09:00:00Z', updatedAt: '2026-05-14T10:00:00Z' },
  { id: 'iss-010', studentId: 'cu-std-5', studentName: 'Ananya Bose', title: 'Hostel Block C – Washroom Drainage Completely Blocked', description: 'All washroom drains in Hostel Block C (Ground & 1st floor) are completely blocked. Water standing for 2 days. 60 students are severely affected. Health hazard.', location: 'Hostel Block C, Ground and First Floor', category: 'Plumbing', priority: 'High', department: 'Maintenance', status: 'Under Review', statusHistory: [{ status: 'Submitted', timestamp: '2026-06-01T07:00:00Z' }, { status: 'Under Review', timestamp: '2026-06-01T09:00:00Z' }], createdAt: '2026-06-01T07:00:00Z', updatedAt: '2026-06-01T09:00:00Z' },
];

const SEED_SOS: SosAlert[] = [
  { id: 'sos-001', studentId: 'cu-std-1', studentName: 'Priya Sharma', type: 'Medical Emergency', description: 'Student collapsed near CE building entrance. Breathing difficulty, possible heat stroke.', location: 'CE Building Main Entrance', status: 'Acknowledged', createdAt: '2026-04-01T14:30:00Z' },
  { id: 'sos-002', studentId: 'cu-std-2', studentName: 'Arjun Verma', type: 'Electrical Hazard', description: 'Exposed live wires discovered in EE Lab corridor after storm. Risk of electrocution.', location: 'Electrical Engineering Building, 2nd Floor Corridor', status: 'Resolved', createdAt: '2026-04-15T09:00:00Z' },
  { id: 'sos-003', studentId: 'cu-std-3', studentName: 'Meera Nair', type: 'Security Threat', description: 'Unknown person with suspicious behaviour spotted in girls\' hostel area. Does not appear to be a student or staff.', location: 'Girls Hostel, Block A Entrance', status: 'Active', createdAt: '2026-05-08T22:15:00Z' },
  { id: 'sos-004', studentId: 'cu-std-4', studentName: 'Rahul Singh', type: 'Fire', description: 'Small fire detected in the chemistry lab storage room. Fire extinguisher used but smoke is spreading.', location: 'Science Block, Chemistry Lab Storage Room', status: 'Acknowledged', createdAt: '2026-05-25T11:45:00Z' },
  { id: 'sos-005', studentId: 'cu-std-5', studentName: 'Ananya Bose', type: 'Other', description: 'Stray dog is aggressive near the parking area, has already chased 3 students. One student may need anti-rabies check.', location: 'Main Campus Parking Area, Gate 2', status: 'Active', createdAt: '2026-06-10T08:00:00Z' },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'nf-001', userId: 'cu-std-1', type: 'issue_resolved', title: 'Issue Resolved ✅', message: '"Water Leakage Near CE Lab 102" has been resolved. Please rate the resolution.', read: true, createdAt: '2026-01-17T16:30:00Z', link: '/student/issues' },
  { id: 'nf-002', userId: 'cu-std-2', type: 'issue_resolved', title: 'Issue Resolved ✅', message: '"Projector Malfunction – IT Seminar Hall" was resolved same-day. Rate the service!', read: true, createdAt: '2026-01-28T17:30:00Z', link: '/student/issues' },
  { id: 'nf-003', userId: 'cu-std-4', type: 'status_changed', title: 'Complaint Status Updated 🔄', message: '"Network Outage – CIVIL CAD Lab" is now In Progress. Assigned to Dr. Sarah Mitchell.', read: true, createdAt: '2026-02-21T09:30:00Z', link: '/student/issues' },
  { id: 'nf-004', userId: 'cu-std-5', type: 'status_changed', title: 'Complaint Assigned 👤', message: '"AC Failure – EE Control Lab" has been assigned to Carlos Rivera. Repair scheduled.', read: false, createdAt: '2026-03-05T10:00:00Z', link: '/student/issues' },
  { id: 'nf-005', userId: 'cu-std-2', type: 'issue_resolved', title: 'Issue Resolved ✅', message: '"Library Reading Room – Sanitation" is resolved. Deep cleaning completed!', read: true, createdAt: '2026-04-10T10:30:00Z', link: '/student/issues' },
  { id: 'nf-006', userId: 'cu-std-3', type: 'status_changed', title: 'Complaint Status Updated 🔄', message: '"Sports Ground Floodlights" repair is In Progress. Estimated completion: 3 days.', read: false, createdAt: '2026-04-22T08:30:00Z', link: '/student/issues' },
  { id: 'nf-007', userId: 'cu-std-1', type: 'booking_approved', title: 'Booking Approved ✓', message: 'Computer Lab A on Jun 25 (09:00–11:00) approved by Dr. Sarah Mitchell.', read: true, createdAt: '2026-06-20T11:00:00Z', link: '/student/booking' },
  { id: 'nf-008', userId: 'cu-std-4', type: 'booking_rejected', title: 'Booking Rejected', message: 'Meeting Room 1 on Jun 22 was rejected. Reason: Room reserved for faculty board meeting.', read: false, createdAt: '2026-06-18T14:00:00Z', link: '/student/booking' },
  { id: 'nf-009', userId: 'cu-std-3', type: 'booking_approved', title: 'Booking Approved ✓', message: 'Auditorium on Jul 5 (09:00–11:00) has been approved for drama rehearsal.', read: true, createdAt: '2026-06-19T10:00:00Z', link: '/student/booking' },
  { id: 'nf-010', userId: 'broadcast', type: 'new_event', title: '🎉 New Event: National Level Hackathon 2026', message: 'Hackathon on Jul 15 at Auditorium. Prizes worth ₹1,00,000! Register now.', read: false, createdAt: '2026-06-01T09:00:00Z', link: '/events' },
  { id: 'nf-011', userId: 'broadcast', type: 'new_event', title: '🏆 Annual Sports Meet Announced!', message: 'Inter-Department Sports Meet on Aug 1 at Sports Complex. Register your team!', read: false, createdAt: '2026-06-12T10:00:00Z', link: '/events' },
  { id: 'nf-012', userId: 'broadcast', type: 'new_notice', title: '📋 Exam Schedule Released', message: 'End Semester Examinations from July 1, 2026. Check the notice board for details.', read: false, createdAt: '2026-06-15T09:00:00Z', link: '/notices' },
  { id: 'nf-013', userId: 'broadcast', type: 'new_notice', title: '🎓 Merit Scholarship Applications Open!', message: 'Students with CGPA ≥ 8.5 can apply for the SAL Institute Merit Scholarship 2026-27.', read: false, createdAt: '2026-06-06T10:00:00Z', link: '/notices' },
  { id: 'nf-014', userId: 'broadcast', type: 'new_notice', title: '📢 Campus Placement: TechCorp Solutions', message: 'Placement drive on June 30. CGPA ≥ 7.5 (CE/IT). Register before June 25.', read: false, createdAt: '2026-06-14T09:00:00Z', link: '/notices' },
  { id: 'nf-015', userId: 'cu-std-1', type: 'sos_update', title: '🚨 SOS Alert Acknowledged', message: 'Your Medical Emergency SOS has been acknowledged. Campus medical team is on the way.', read: true, createdAt: '2026-04-01T14:45:00Z', link: '/student/sos' },
  { id: 'nf-016', userId: 'cu-std-2', type: 'sos_update', title: '✅ Emergency Resolved', message: 'Your Electrical Hazard SOS has been resolved. Wiring has been secured by maintenance.', read: true, createdAt: '2026-04-15T11:00:00Z', link: '/student/sos' },
  { id: 'nf-017', userId: 'cu-std-4', type: 'status_changed', title: 'Complaint Assigned 👤', message: '"CE Computer Lab B – 5 Workstations" assigned to Prof. James Carter for repair.', read: false, createdAt: '2026-05-13T09:30:00Z', link: '/student/issues' },
  { id: 'nf-018', userId: 'cu-std-5', type: 'status_changed', title: 'Complaint Submitted ✓', message: '"Hostel Block C – Drainage Blocked" received. Under review by maintenance team.', read: false, createdAt: '2026-06-01T09:30:00Z', link: '/student/issues' },
  { id: 'nf-019', userId: 'broadcast', type: 'new_event', title: '🤖 Industry Talk: AI & Future of Engineering', message: 'Seminar on Jul 10 at 11:00 AM in Seminar Hall. Expert from TechCorp Solutions.', read: false, createdAt: '2026-06-14T11:00:00Z', link: '/events' },
  { id: 'nf-020', userId: 'broadcast', type: 'new_notice', title: '📶 WiFi Upgrade Scheduled', message: 'Campus WiFi upgrade on June 26, 2:00 AM – 6:00 AM. Expect brief outage. Speed will increase 10x.', read: false, createdAt: '2026-06-04T08:00:00Z', link: '/notices' },
];

function seedOnce(initKey: string, dataKey: string, seed: unknown[]) {
  if (!localStorage.getItem(initKey)) { ls_set(dataKey, seed); localStorage.setItem(initKey, '1'); }
}

export function initStudentStore() {
  seedOnce('cf_issues_init_v2', KEYS.issues, SEED_ISSUES);
  seedOnce('cf_sos_init_v2', KEYS.sos, SEED_SOS);
  seedOnce('cf_notifications_init_v2', KEYS.notifications, SEED_NOTIFICATIONS);
}

// ── AI Categorizer ─────────────────────────────────────────────────────────
export const categorizeIssue = (title: string, description: string): { category: string; priority: IssuePriority; department: string } => {
  const text = (title + ' ' + description).toLowerCase();
  const rules: Array<{ keywords: string[]; category: string; priority: IssuePriority; department: string }> = [
    { keywords: ['fire', 'smoke', 'flame', 'burn', 'extinguisher'], category: 'Fire Safety', priority: 'Critical', department: 'Security' },
    { keywords: ['water', 'leak', 'flood', 'pipe', 'tap', 'drain', 'sewage', 'toilet', 'bathroom'], category: 'Plumbing', priority: 'High', department: 'Maintenance' },
    { keywords: ['lift', 'elevator'], category: 'Elevator', priority: 'High', department: 'Maintenance' },
    { keywords: ['security', 'theft', 'steal', 'suspicious', 'trespassing', 'threat'], category: 'Security', priority: 'High', department: 'Security' },
    { keywords: ['fan', 'ac', 'air condition', 'cooling', 'light', 'bulb', 'switch', 'power', 'socket', 'wire', 'electrical'], category: 'Electrical', priority: 'Medium', department: 'Electrical' },
    { keywords: ['wifi', 'internet', 'network', 'connection', 'computer', 'laptop', 'projector', 'screen', 'printer'], category: 'IT Support', priority: 'Medium', department: 'IT Department' },
    { keywords: ['door', 'lock', 'key', 'window', 'gate', 'glass', 'roof', 'ceiling', 'wall', 'floor'], category: 'Infrastructure', priority: 'Medium', department: 'Maintenance' },
    { keywords: ['chair', 'table', 'furniture', 'desk', 'bench', 'board', 'whiteboard'], category: 'Furniture', priority: 'Low', department: 'Housekeeping' },
    { keywords: ['garbage', 'waste', 'dirty', 'clean', 'hygiene', 'smell', 'odour', 'pest'], category: 'Sanitation', priority: 'Low', department: 'Housekeeping' },
  ];
  for (const rule of rules) {
    if (rule.keywords.some(kw => text.includes(kw))) return { category: rule.category, priority: rule.priority, department: rule.department };
  }
  return { category: 'General', priority: 'Low', department: 'Administration' };
};

// ── Issue Store ─────────────────────────────────────────────────────────────
export const issueStore = {
  getAll(): Issue[] { return ls<Issue[]>(KEYS.issues, []); },
  getByStudent(studentId: string): Issue[] { return this.getAll().filter(i => i.studentId === studentId); },
  getById(id: string): Issue | undefined { return this.getAll().find(i => i.id === id); },
  create(data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'status'>): Issue {
    const now = new Date().toISOString();
    const issue: Issue = { ...data, id: uid(), status: 'Submitted', statusHistory: [{ status: 'Submitted', timestamp: now }], createdAt: now, updatedAt: now };
    const all = this.getAll(); all.unshift(issue); ls_set(KEYS.issues, all); return issue;
  },
  update(id: string, patch: Partial<Issue>): Issue | undefined {
    const all = this.getAll(); const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    const prev = all[idx]!;
    const updated: Issue = { ...prev, ...patch, updatedAt: new Date().toISOString() };
    if (patch.status && patch.status !== prev.status) {
      updated.statusHistory = [...prev.statusHistory, { status: patch.status, timestamp: updated.updatedAt, note: patch.resolutionNotes }];
    }
    all[idx] = updated; ls_set(KEYS.issues, all); return updated;
  },
  addRating(id: string, stars: number, comment: string): Issue | undefined { return this.update(id, { rating: { stars, comment } }); },
};

// ── SOS Store ───────────────────────────────────────────────────────────────
export const sosStore = {
  getAll(): SosAlert[] { return ls<SosAlert[]>(KEYS.sos, []); },
  getByStudent(studentId: string): SosAlert[] { return this.getAll().filter(s => s.studentId === studentId); },
  create(data: Omit<SosAlert, 'id' | 'createdAt' | 'status'>): SosAlert {
    const alert: SosAlert = { ...data, id: uid(), status: 'Active', createdAt: new Date().toISOString() };
    const all = this.getAll(); all.unshift(alert); ls_set(KEYS.sos, all); return alert;
  },
};

// ── Lost & Found Store ──────────────────────────────────────────────────────
export const lostFoundStore = {
  getAll(): LostFoundItem[] { return ls<LostFoundItem[]>(KEYS.lostFound, []); },
  getByStudent(studentId: string): LostFoundItem[] { return this.getAll().filter(i => i.studentId === studentId); },
  create(data: Omit<LostFoundItem, 'id' | 'createdAt' | 'status'>): LostFoundItem {
    const item: LostFoundItem = { ...data, id: uid(), status: 'Reported', createdAt: new Date().toISOString() };
    const all = this.getAll(); all.unshift(item); ls_set(KEYS.lostFound, all); return item;
  },
};

// ── Notification Store ──────────────────────────────────────────────────────
export const notificationStore = {
  getAll(): AppNotification[] { return ls<AppNotification[]>(KEYS.notifications, []); },
  getByUser(userId: string): AppNotification[] {
    return this.getAll().filter(n => n.userId === userId || n.userId === 'broadcast');
  },
  getUnreadCount(userId: string): number { return this.getByUser(userId).filter(n => !n.read).length; },
  add(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const n: AppNotification = { ...data, id: uid(), read: false, createdAt: new Date().toISOString() };
    const all = this.getAll(); all.unshift(n); ls_set(KEYS.notifications, all); return n;
  },
  markRead(id: string) {
    const all = this.getAll(); const idx = all.findIndex(n => n.id === id);
    if (idx !== -1) { all[idx]!.read = true; ls_set(KEYS.notifications, all); }
  },
  markAllRead(userId: string) {
    ls_set(KEYS.notifications, this.getAll().map(n => (n.userId === userId || n.userId === 'broadcast') ? { ...n, read: true } : n));
  },
};
