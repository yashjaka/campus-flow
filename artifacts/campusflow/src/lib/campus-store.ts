function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function ls<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fallback; } catch { return fallback; }
}
function ls_set(k: string, v: unknown) { localStorage.setItem(k, JSON.stringify(v)); }

export type UserRole = 'student' | 'faculty' | 'maintenance' | 'admin';

export interface CampusUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  enrollmentNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  resource: string;
  date: string;
  timeSlot: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  managedBy?: string;
  rejectedReason?: string;
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  createdBy: string;
  createdByRole: string;
  attendees: string[];
  savedBy: string[];
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedBy: string;
  publishedByRole: string;
  bookmarkedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'choice';
  options?: string[];
}
export interface SurveyResponse {
  studentId: string;
  studentName: string;
  answers: Record<string, string | number>;
  submittedAt: string;
}
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdBy: string;
  createdByRole: string;
  isActive: boolean;
  responses: SurveyResponse[];
  createdAt: string;
}

export const RESOURCES = [
  'Seminar Hall', 'Auditorium', 'Computer Lab A', 'Computer Lab B',
  'Meeting Room 1', 'Meeting Room 2', 'Projector (Portable)',
];
export const TIME_SLOTS = [
  '09:00 – 11:00', '11:00 – 13:00', '13:00 – 15:00',
  '15:00 – 17:00', '17:00 – 19:00',
];
export const EVENT_TYPES = ['Workshop', 'Seminar', 'Cultural Event', 'Sports Event', 'Hackathon'] as const;
export const NOTICE_CATEGORIES = ['Academic', 'Examination', 'Placement', 'Circular', 'Announcement'] as const;

const KEYS = {
  users: 'cf_campus_users',
  usersInit: 'cf_campus_users_init',
  bookings: 'cf_bookings',
  events: 'cf_events',
  eventsInit: 'cf_events_init',
  notices: 'cf_notices',
  noticesInit: 'cf_notices_init',
  surveys: 'cf_surveys',
  surveysInit: 'cf_surveys_init',
};

const SEED_USERS: CampusUser[] = [
  { id: 'cu-admin-1', name: 'Campus Admin', email: 'admin@campusflow.demo', role: 'admin', department: 'Administration', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-fac-1', name: 'Dr. Sarah Mitchell', email: 'sarah.mitchell@campusflow.demo', role: 'faculty', department: 'Computer Science', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-fac-2', name: 'Prof. James Carter', email: 'james.carter@campusflow.demo', role: 'faculty', department: 'Mathematics', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-mnt-1', name: 'Carlos Rivera', email: 'carlos.rivera@campusflow.demo', role: 'maintenance', department: 'Facilities', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-std-1', name: 'Priya Sharma', email: 'priya.sharma@campusflow.demo', role: 'student', enrollmentNumber: 'ENR2024001', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-std-2', name: 'Arjun Verma', email: 'arjun.verma@campusflow.demo', role: 'student', enrollmentNumber: 'ENR2024002', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-std-3', name: 'Meera Nair', email: 'meera.nair@campusflow.demo', role: 'student', enrollmentNumber: 'ENR2024003', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-std-4', name: 'Rahul Singh', email: 'rahul.singh@campusflow.demo', role: 'student', enrollmentNumber: 'ENR2024004', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cu-std-5', name: 'Ananya Bose', email: 'ananya.bose@campusflow.demo', role: 'student', enrollmentNumber: 'ENR2024005', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
];

const SEED_EVENTS: CampusEvent[] = [
  { id: 'evt-001', title: 'National Level Hackathon 2026', description: 'A 24-hour hackathon open to all students. Build innovative solutions to real-world problems. Prizes worth ₹1,00,000.', type: 'Hackathon', date: '2026-07-15', time: '09:00', venue: 'Auditorium', createdBy: 'Dr. Sarah Mitchell', createdByRole: 'faculty', attendees: [], savedBy: [], createdAt: '2026-06-01T00:00:00Z' },
  { id: 'evt-002', title: 'Annual Cultural Fest', description: 'Celebrate diversity and talent with performances, exhibitions, and cultural competitions across all departments.', type: 'Cultural Event', date: '2026-07-20', time: '10:00', venue: 'Main Ground', createdBy: 'Campus Admin', createdByRole: 'admin', attendees: [], savedBy: [], createdAt: '2026-06-05T00:00:00Z' },
  { id: 'evt-003', title: 'Research Methodology Workshop', description: 'Learn advanced research techniques and publication strategies from industry experts. Limited to 60 participants.', type: 'Workshop', date: '2026-06-28', time: '14:00', venue: 'Seminar Hall', createdBy: 'Prof. James Carter', createdByRole: 'faculty', attendees: [], savedBy: [], createdAt: '2026-06-10T00:00:00Z' },
];

const SEED_NOTICES: Notice[] = [
  { id: 'ntc-001', title: 'End Semester Examination Schedule – July 2026', content: 'The end semester examinations will commence from July 1, 2026. Students are advised to check the detailed schedule on the examination portal. Hall tickets will be distributed from June 25, 2026. No re-scheduling requests will be entertained after June 22.', category: 'Examination', publishedBy: 'Campus Admin', publishedByRole: 'admin', bookmarkedBy: [], createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
  { id: 'ntc-002', title: 'Campus Placement Drive – TechCorp Solutions', content: 'TechCorp Solutions will be conducting a placement drive on June 30, 2026. Eligible students (CGPA ≥ 7.5, B.Tech CS/IT final year) must register before June 25. Pre-placement talk at 10:00 AM in the Auditorium. Bring 3 copies of your updated resume.', category: 'Placement', publishedBy: 'Dr. Sarah Mitchell', publishedByRole: 'faculty', bookmarkedBy: [], createdAt: '2026-06-14T00:00:00Z', updatedAt: '2026-06-14T00:00:00Z' },
  { id: 'ntc-003', title: 'Library Open 24/7 During Examination Season', content: 'The central library will be open 24/7 from June 20 to July 10, 2026 during the examination season. Students must carry their ID cards for after-hours access. The reading room capacity is 200 students.', category: 'Circular', publishedBy: 'Campus Admin', publishedByRole: 'admin', bookmarkedBy: [], createdAt: '2026-06-18T00:00:00Z', updatedAt: '2026-06-18T00:00:00Z' },
  { id: 'ntc-004', title: 'New Elective Courses for Next Semester', content: 'The academic committee has approved 6 new elective courses for the upcoming semester: Machine Learning Applications, Blockchain Technology, Cloud Architecture, UI/UX Design, Environmental Science, and Entrepreneurship. Students can register preferences via the academic portal.', category: 'Academic', publishedBy: 'Prof. James Carter', publishedByRole: 'faculty', bookmarkedBy: [], createdAt: '2026-06-12T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z' },
];

const SEED_SURVEYS: Survey[] = [
  {
    id: 'srv-001', title: 'Campus Facilities Feedback – June 2026', description: 'Help us improve campus facilities by sharing your honest experience.',
    questions: [
      { id: 'sq1', text: 'How would you rate overall campus cleanliness?', type: 'rating' },
      { id: 'sq2', text: 'How satisfied are you with library resources?', type: 'rating' },
      { id: 'sq3', text: 'Which area needs the most improvement?', type: 'choice', options: ['Hostels', 'Classrooms', 'Labs', 'Cafeteria', 'Sports Facilities'] },
      { id: 'sq4', text: 'Any specific suggestions for improvement?', type: 'text' },
    ],
    createdBy: 'Campus Admin', createdByRole: 'admin', isActive: true, responses: [], createdAt: '2026-06-10T00:00:00Z',
  },
];

function seedOnce(initKey: string, dataKey: string, seed: unknown[]) {
  if (!localStorage.getItem(initKey)) {
    ls_set(dataKey, seed);
    localStorage.setItem(initKey, '1');
  }
}

export function initCampusStore() {
  seedOnce(KEYS.usersInit, KEYS.users, SEED_USERS);
  seedOnce(KEYS.eventsInit, KEYS.events, SEED_EVENTS);
  seedOnce(KEYS.noticesInit, KEYS.notices, SEED_NOTICES);
  seedOnce(KEYS.surveysInit, KEYS.surveys, SEED_SURVEYS);
}

export const campusUserStore = {
  getAll(): CampusUser[] { return ls<CampusUser[]>(KEYS.users, []); },
  getStaff(): CampusUser[] { return this.getAll().filter(u => u.role === 'faculty' || u.role === 'maintenance'); },
  getByRole(role: UserRole): CampusUser[] { return this.getAll().filter(u => u.role === role); },
  create(data: Omit<CampusUser, 'id' | 'createdAt'>): CampusUser {
    const user: CampusUser = { ...data, id: uid(), createdAt: new Date().toISOString() };
    const all = this.getAll(); all.push(user); ls_set(KEYS.users, all); return user;
  },
  toggleActive(id: string) {
    const all = this.getAll().map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    ls_set(KEYS.users, all);
  },
};

export const bookingStore = {
  getAll(): Booking[] { return ls<Booking[]>(KEYS.bookings, []); },
  getByStudent(studentId: string): Booking[] { return this.getAll().filter(b => b.studentId === studentId); },
  getPending(): Booking[] { return this.getAll().filter(b => b.status === 'Pending'); },
  isSlotTaken(resource: string, date: string, timeSlot: string, excludeId?: string): boolean {
    return this.getAll().some(b => b.resource === resource && b.date === date && b.timeSlot === timeSlot && b.status === 'Approved' && b.id !== excludeId);
  },
  create(data: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
    const b: Booking = { ...data, id: uid(), status: 'Pending', createdAt: new Date().toISOString() };
    const all = this.getAll(); all.unshift(b); ls_set(KEYS.bookings, all); return b;
  },
  approve(id: string, by: string): Booking | undefined {
    const all = this.getAll(); const idx = all.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx]!, status: 'Approved', managedBy: by };
    ls_set(KEYS.bookings, all); return all[idx];
  },
  reject(id: string, by: string, reason: string): Booking | undefined {
    const all = this.getAll(); const idx = all.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx]!, status: 'Rejected', managedBy: by, rejectedReason: reason };
    ls_set(KEYS.bookings, all); return all[idx];
  },
};

export const eventStore = {
  getAll(): CampusEvent[] { return ls<CampusEvent[]>(KEYS.events, []); },
  create(data: Omit<CampusEvent, 'id' | 'createdAt' | 'attendees' | 'savedBy'>): CampusEvent {
    const e: CampusEvent = { ...data, id: uid(), attendees: [], savedBy: [], createdAt: new Date().toISOString() };
    const all = this.getAll(); all.unshift(e); ls_set(KEYS.events, all); return e;
  },
  update(id: string, patch: Partial<CampusEvent>) {
    const all = this.getAll().map(e => e.id === id ? { ...e, ...patch } : e);
    ls_set(KEYS.events, all);
  },
  delete(id: string) { ls_set(KEYS.events, this.getAll().filter(e => e.id !== id)); },
  toggleAttend(id: string, studentId: string) {
    const all = this.getAll().map(e => {
      if (e.id !== id) return e;
      const attendees = e.attendees.includes(studentId) ? e.attendees.filter(a => a !== studentId) : [...e.attendees, studentId];
      return { ...e, attendees };
    });
    ls_set(KEYS.events, all);
  },
  toggleSave(id: string, studentId: string) {
    const all = this.getAll().map(e => {
      if (e.id !== id) return e;
      const savedBy = e.savedBy.includes(studentId) ? e.savedBy.filter(s => s !== studentId) : [...e.savedBy, studentId];
      return { ...e, savedBy };
    });
    ls_set(KEYS.events, all);
  },
};

export const noticeStore = {
  getAll(): Notice[] { return ls<Notice[]>(KEYS.notices, []); },
  create(data: Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'bookmarkedBy'>): Notice {
    const n: Notice = { ...data, id: uid(), bookmarkedBy: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const all = this.getAll(); all.unshift(n); ls_set(KEYS.notices, all); return n;
  },
  update(id: string, patch: Partial<Notice>) {
    const all = this.getAll().map(n => n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n);
    ls_set(KEYS.notices, all);
  },
  delete(id: string) { ls_set(KEYS.notices, this.getAll().filter(n => n.id !== id)); },
  toggleBookmark(id: string, studentId: string) {
    const all = this.getAll().map(n => {
      if (n.id !== id) return n;
      const bookmarkedBy = n.bookmarkedBy.includes(studentId) ? n.bookmarkedBy.filter(b => b !== studentId) : [...n.bookmarkedBy, studentId];
      return { ...n, bookmarkedBy };
    });
    ls_set(KEYS.notices, all);
  },
};

export const surveyStore = {
  getAll(): Survey[] { return ls<Survey[]>(KEYS.surveys, []); },
  getActive(): Survey[] { return this.getAll().filter(s => s.isActive); },
  create(data: Omit<Survey, 'id' | 'createdAt' | 'responses'>): Survey {
    const s: Survey = { ...data, id: uid(), responses: [], createdAt: new Date().toISOString() };
    const all = this.getAll(); all.unshift(s); ls_set(KEYS.surveys, all); return s;
  },
  respond(surveyId: string, response: SurveyResponse) {
    const all = this.getAll().map(s => s.id === surveyId ? { ...s, responses: [...s.responses, response] } : s);
    ls_set(KEYS.surveys, all);
  },
  hasResponded(surveyId: string, studentId: string): boolean {
    const s = this.getAll().find(s => s.id === surveyId);
    return !!s?.responses.some(r => r.studentId === studentId);
  },
  toggleActive(id: string) {
    const all = this.getAll().map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    ls_set(KEYS.surveys, all);
  },
};
