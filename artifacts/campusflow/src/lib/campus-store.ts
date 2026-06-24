function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function ls<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
}
function ls_set(k: string, v: unknown) {
  localStorage.setItem(k, JSON.stringify(v));
}

export type UserRole = "student" | "faculty" | "maintenance" | "admin";

export interface CampusUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  enrollmentNumber?: string;
  collegeName?: string;
  semester?: number;
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
  status: "Pending" | "Approved" | "Rejected";
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
  type: "rating" | "text" | "choice";
  options?: string[];
  rawOptions?: string;
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
  "Seminar Hall",
  "Auditorium",
  "Computer Lab A",
  "Computer Lab B",
  "Meeting Room 1",
  "Meeting Room 2",
  "Projector (Portable)",
];
export const TIME_SLOTS = [
  "09:00 – 11:00",
  "11:00 – 13:00",
  "13:00 – 15:00",
  "15:00 – 17:00",
  "17:00 – 19:00",
];
export const EVENT_TYPES = [
  "Workshop",
  "Seminar",
  "Cultural Event",
  "Sports Event",
  "Hackathon",
] as const;
export const NOTICE_CATEGORIES = [
  "Academic",
  "Examination",
  "Placement",
  "Circular",
  "Announcement",
] as const;

const KEYS = {
  users: "cf_campus_users",
  usersInit: "cf_campus_users_init_v2",
  bookings: "cf_bookings",
  bookingsInit: "cf_bookings_init_v2",
  events: "cf_events",
  eventsInit: "cf_events_init_v2",
  notices: "cf_notices",
  noticesInit: "cf_notices_init_v2",
  surveys: "cf_surveys",
  surveysInit: "cf_surveys_init_v2",
};

const SEED_USERS: CampusUser[] = [
  {
    id: "cu-admin-1",
    name: "Campus Admin",
    email: "admin@campusflow.demo",
    role: "admin",
    department: "Administration",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-fac-1",
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@campusflow.demo",
    role: "faculty",
    department: "Computer Engineering",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-fac-2",
    name: "Prof. James Carter",
    email: "james.carter@campusflow.demo",
    role: "faculty",
    department: "Information Technology",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-mnt-1",
    name: "Carlos Rivera",
    email: "carlos.rivera@campusflow.demo",
    role: "maintenance",
    department: "Facilities & Maintenance",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-std-1",
    name: "Priya Sharma",
    email: "priya.sharma@campusflow.demo",
    role: "student",
    enrollmentNumber: "ENR2024001",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-std-2",
    name: "Arjun Verma",
    email: "arjun.verma@campusflow.demo",
    role: "student",
    enrollmentNumber: "ENR2024002",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-std-3",
    name: "Meera Nair",
    email: "meera.nair@campusflow.demo",
    role: "student",
    enrollmentNumber: "ENR2024003",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-std-4",
    name: "Rahul Singh",
    email: "rahul.singh@campusflow.demo",
    role: "student",
    enrollmentNumber: "ENR2024004",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu-std-5",
    name: "Ananya Bose",
    email: "ananya.bose@campusflow.demo",
    role: "student",
    enrollmentNumber: "ENR2024005",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: "bk-001",
    studentId: "cu-std-1",
    studentName: "Priya Sharma",
    resource: "Computer Lab A",
    date: "2026-06-25",
    timeSlot: "09:00 – 11:00",
    purpose: "Final year project presentation practice",
    status: "Approved",
    managedBy: "Dr. Sarah Mitchell",
    createdAt: "2026-06-20T10:00:00Z",
  },
  {
    id: "bk-002",
    studentId: "cu-std-2",
    studentName: "Arjun Verma",
    resource: "Seminar Hall",
    date: "2026-06-27",
    timeSlot: "14:00 – 16:00",
    purpose: "Department technical quiz hosting",
    status: "Pending",
    createdAt: "2026-06-21T09:00:00Z",
  },
  {
    id: "bk-003",
    studentId: "cu-std-3",
    studentName: "Meera Nair",
    resource: "Auditorium",
    date: "2026-07-05",
    timeSlot: "09:00 – 11:00",
    purpose: "Drama club cultural performance rehearsal",
    status: "Approved",
    managedBy: "Campus Admin",
    createdAt: "2026-06-18T14:00:00Z",
  },
  {
    id: "bk-004",
    studentId: "cu-std-4",
    studentName: "Rahul Singh",
    resource: "Meeting Room 1",
    date: "2026-06-22",
    timeSlot: "11:00 – 13:00",
    purpose: "Student council meeting",
    status: "Rejected",
    managedBy: "Campus Admin",
    rejectedReason: "Room reserved for faculty board meeting",
    createdAt: "2026-06-17T11:00:00Z",
  },
  {
    id: "bk-005",
    studentId: "cu-std-5",
    studentName: "Ananya Bose",
    resource: "Projector (Portable)",
    date: "2026-06-28",
    timeSlot: "13:00 – 15:00",
    purpose: "IEEE student chapter presentation",
    status: "Approved",
    managedBy: "Prof. James Carter",
    createdAt: "2026-06-19T16:00:00Z",
  },
];

const SEED_EVENTS: CampusEvent[] = [
  {
    id: "evt-001",
    title: "National Level Hackathon 2026",
    description:
      "A 24-hour coding challenge open to all SAL Institute students. Build innovative solutions to real-world campus and social problems. Cash prizes worth ₹1,00,000 + internship opportunities.",
    type: "Hackathon",
    date: "2026-07-15",
    time: "09:00",
    venue: "Auditorium",
    createdBy: "Dr. Sarah Mitchell",
    createdByRole: "faculty",
    attendees: ["cu-std-1", "cu-std-2", "cu-std-4"],
    savedBy: ["cu-std-3", "cu-std-5"],
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "evt-002",
    title: "Annual Cultural Fest – Utsav 2026",
    description:
      "Celebrate diversity and talent at SAL Institute's biggest cultural event. Live performances, food stalls, dance competitions, art exhibitions and more!",
    type: "Cultural Event",
    date: "2026-07-20",
    time: "10:00",
    venue: "Main Ground",
    createdBy: "Campus Admin",
    createdByRole: "admin",
    attendees: ["cu-std-1", "cu-std-3", "cu-std-5"],
    savedBy: ["cu-std-2", "cu-std-4"],
    createdAt: "2026-06-05T00:00:00Z",
  },
  {
    id: "evt-003",
    title: "Research Methodology & Paper Writing Workshop",
    description:
      "Learn advanced research techniques, literature review strategies, and paper publication guidelines from experienced faculty and published researchers. Limited to 60 seats.",
    type: "Workshop",
    date: "2026-06-28",
    time: "14:00",
    venue: "Seminar Hall",
    createdBy: "Prof. James Carter",
    createdByRole: "faculty",
    attendees: ["cu-std-2", "cu-std-4"],
    savedBy: ["cu-std-1"],
    createdAt: "2026-06-10T00:00:00Z",
  },
  {
    id: "evt-004",
    title: "Annual Inter-Department Sports Meet",
    description:
      "Compete in cricket, football, basketball, badminton, table tennis and chess. Represent your department and bring home the trophy!",
    type: "Sports Event",
    date: "2026-08-01",
    time: "08:00",
    venue: "Sports Complex",
    createdBy: "Campus Admin",
    createdByRole: "admin",
    attendees: ["cu-std-1", "cu-std-2", "cu-std-3", "cu-std-4", "cu-std-5"],
    savedBy: [],
    createdAt: "2026-06-12T00:00:00Z",
  },
  {
    id: "evt-005",
    title: "Industry Expert Talk: AI & Future of Engineering",
    description:
      "Join us for an insightful session with senior engineers from TechCorp Solutions discussing how AI is reshaping civil, mechanical, and electrical engineering sectors.",
    type: "Seminar",
    date: "2026-07-10",
    time: "11:00",
    venue: "Seminar Hall",
    createdBy: "Dr. Sarah Mitchell",
    createdByRole: "faculty",
    attendees: ["cu-std-3", "cu-std-5"],
    savedBy: ["cu-std-1", "cu-std-2"],
    createdAt: "2026-06-14T00:00:00Z",
  },
];

const SEED_NOTICES: Notice[] = [
  {
    id: "ntc-001",
    title: "End Semester Examination Schedule – July 2026",
    content:
      "The end semester examinations will commence from July 1, 2026. Students are advised to check the detailed schedule. Hall tickets will be distributed from June 25, 2026. No re-scheduling requests will be entertained after June 22. All students must ensure their attendance is above 75%.",
    category: "Examination",
    publishedBy: "Campus Admin",
    publishedByRole: "admin",
    bookmarkedBy: ["cu-std-1", "cu-std-3"],
    createdAt: "2026-06-15T00:00:00Z",
    updatedAt: "2026-06-15T00:00:00Z",
  },
  {
    id: "ntc-002",
    title: "Campus Placement Drive – TechCorp Solutions (Batch 2026)",
    content:
      "TechCorp Solutions will be conducting a placement drive for the 2026 batch on June 30, 2026. Eligible students (CGPA ≥ 7.5, B.Tech CE/IT final year) must register on the placement portal before June 25. Pre-placement talk at 10:00 AM in the Auditorium. Bring 3 updated resume copies and your original mark sheets.",
    category: "Placement",
    publishedBy: "Dr. Sarah Mitchell",
    publishedByRole: "faculty",
    bookmarkedBy: ["cu-std-2", "cu-std-4"],
    createdAt: "2026-06-14T00:00:00Z",
    updatedAt: "2026-06-14T00:00:00Z",
  },
  {
    id: "ntc-003",
    title: "Central Library Open 24/7 During Examination Season",
    content:
      "The central library will be open round-the-clock from June 20 to July 10, 2026 during the examination season. Students must carry their ID cards for after-hours access. Reading room capacity is 200 students. Silence must be maintained at all times.",
    category: "Circular",
    publishedBy: "Campus Admin",
    publishedByRole: "admin",
    bookmarkedBy: ["cu-std-5"],
    createdAt: "2026-06-18T00:00:00Z",
    updatedAt: "2026-06-18T00:00:00Z",
  },
  {
    id: "ntc-004",
    title: "New Elective Courses Available for Next Semester",
    content:
      "The academic committee has approved 6 new elective courses for the upcoming semester: Machine Learning Applications, Blockchain Technology, Cloud Architecture, UI/UX Design, Environmental Science, and Entrepreneurship. Students can register their preferences via the academic portal before June 30.",
    category: "Academic",
    publishedBy: "Prof. James Carter",
    publishedByRole: "faculty",
    bookmarkedBy: [],
    createdAt: "2026-06-12T00:00:00Z",
    updatedAt: "2026-06-12T00:00:00Z",
  },
  {
    id: "ntc-005",
    title: "Anti-Ragging Policy – Zero Tolerance Update",
    content:
      "SAL Institute reaffirms its ZERO TOLERANCE policy towards ragging in any form. Any act of ragging, physical or mental harassment, will result in immediate expulsion. All students and faculty are requested to report any incidents to the Anti-Ragging Committee or call the helpline: 1800-180-5522. Anonymous reporting is available.",
    category: "Circular",
    publishedBy: "Campus Admin",
    publishedByRole: "admin",
    bookmarkedBy: [],
    createdAt: "2026-06-08T00:00:00Z",
    updatedAt: "2026-06-08T00:00:00Z",
  },
  {
    id: "ntc-006",
    title: "Merit Scholarship Applications Open – 2026-27",
    content:
      "Applications are now open for SAL Institute Merit Scholarships for the academic year 2026-27. Students with CGPA ≥ 8.5 are eligible. Scholarships cover 50-100% tuition fee waiver. Submit your application with latest mark sheets and income certificate to the scholarship office by July 15, 2026.",
    category: "Announcement",
    publishedBy: "Campus Admin",
    publishedByRole: "admin",
    bookmarkedBy: ["cu-std-1", "cu-std-2", "cu-std-3", "cu-std-4"],
    createdAt: "2026-06-06T00:00:00Z",
    updatedAt: "2026-06-06T00:00:00Z",
  },
  {
    id: "ntc-007",
    title: "Campus WiFi Infrastructure Upgrade – Brief Outage Notice",
    content:
      "The campus network will undergo a major infrastructure upgrade on June 26, 2026 between 2:00 AM and 6:00 AM. During this period, all WiFi and LAN services will be unavailable. Please plan your work accordingly. After the upgrade, WiFi speeds will improve from 100 Mbps to 1 Gbps across all zones.",
    category: "Circular",
    publishedBy: "Prof. James Carter",
    publishedByRole: "faculty",
    bookmarkedBy: [],
    createdAt: "2026-06-04T00:00:00Z",
    updatedAt: "2026-06-04T00:00:00Z",
  },
  {
    id: "ntc-008",
    title: "Emergency Contact Directory – All Students Must Save",
    content:
      "Please save the following emergency numbers: Campus Security: 079-XXXXXXX | Medical Room: Ext. 101 | Fire Emergency: 101 | Anti-Ragging: 1800-180-5522 | Counselling Cell: Ext. 205 | Transport Office: Ext. 308. These numbers are also displayed on the CampusFlow SOS feature.",
    category: "Announcement",
    publishedBy: "Campus Admin",
    publishedByRole: "admin",
    bookmarkedBy: ["cu-std-1", "cu-std-2", "cu-std-3", "cu-std-4", "cu-std-5"],
    createdAt: "2026-06-02T00:00:00Z",
    updatedAt: "2026-06-02T00:00:00Z",
  },
];

const mockResponses = (
  studentIds: string[],
  names: string[],
  answers: Record<string, string | number>[],
): SurveyResponse[] =>
  studentIds.slice(0, answers.length).map((id, i) => ({
    studentId: id,
    studentName: names[i]!,
    answers: answers[i]!,
    submittedAt: `2026-06-${10 + i}T10:00:00Z`,
  }));

const stdIds = ["cu-std-1", "cu-std-2", "cu-std-3", "cu-std-4", "cu-std-5"];
const stdNames = [
  "Priya Sharma",
  "Arjun Verma",
  "Meera Nair",
  "Rahul Singh",
  "Ananya Bose",
];

const SEED_SURVEYS: Survey[] = [
  {
    id: "srv-001",
    title: "Campus Facilities Feedback – June 2026",
    description:
      "Help us improve campus facilities by sharing your honest experience and suggestions.",
    questions: [
      {
        id: "sq1",
        text: "Rate the overall cleanliness of campus facilities",
        type: "rating",
      },
      {
        id: "sq2",
        text: "Rate the library resources and services",
        type: "rating",
      },
      {
        id: "sq3",
        text: "Which area needs the most improvement?",
        type: "choice",
        options: [
          "Hostels",
          "Classrooms",
          "Labs",
          "Cafeteria",
          "Sports Facilities",
        ],
      },
      {
        id: "sq4",
        text: "Any specific suggestions for improvement?",
        type: "text",
      },
    ],
    createdBy: "Campus Admin",
    createdByRole: "admin",
    isActive: true,
    responses: mockResponses(stdIds, stdNames, [
      { sq1: 4, sq2: 5, sq3: "Labs", sq4: "More computers in Lab B please." },
      {
        sq1: 3,
        sq2: 4,
        sq3: "Cafeteria",
        sq4: "Better healthy food options needed.",
      },
      {
        sq1: 5,
        sq2: 5,
        sq3: "Hostels",
        sq4: "Hostel common room needs renovation.",
      },
      {
        sq1: 4,
        sq2: 3,
        sq3: "Sports Facilities",
        sq4: "Need more basketball courts.",
      },
      {
        sq1: 3,
        sq2: 4,
        sq3: "Classrooms",
        sq4: "Air conditioning in classrooms needs fixing.",
      },
    ]),
    createdAt: "2026-06-10T00:00:00Z",
  },
  {
    id: "srv-002",
    title: "Teaching Quality Assessment – CE Department",
    description:
      "Rate your overall learning experience in the Computer Engineering department this semester.",
    questions: [
      {
        id: "tq1",
        text: "Rate the quality of lectures and teaching methods",
        type: "rating",
      },
      {
        id: "tq2",
        text: "Rate the relevance of course content to industry",
        type: "rating",
      },
      {
        id: "tq3",
        text: "Which subject do you find most challenging?",
        type: "choice",
        options: [
          "Data Structures",
          "DBMS",
          "Operating Systems",
          "Computer Networks",
          "Software Engineering",
        ],
      },
      {
        id: "tq4",
        text: "Suggestions to improve teaching quality?",
        type: "text",
      },
    ],
    createdBy: "Dr. Sarah Mitchell",
    createdByRole: "faculty",
    isActive: true,
    responses: mockResponses(stdIds, stdNames, [
      {
        tq1: 5,
        tq2: 4,
        tq3: "Computer Networks",
        tq4: "More practical sessions would help.",
      },
      {
        tq1: 4,
        tq2: 5,
        tq3: "Data Structures",
        tq4: "Guest lectures from industry would be valuable.",
      },
      {
        tq1: 4,
        tq2: 4,
        tq3: "Operating Systems",
        tq4: "Online resources shared after class are very helpful.",
      },
    ]),
    createdAt: "2026-06-12T00:00:00Z",
  },
  {
    id: "srv-003",
    title: "Library Services Survey",
    description:
      "Share your feedback on library resources, accessibility, and services.",
    questions: [
      {
        id: "lq1",
        text: "Rate the availability of study materials and books",
        type: "rating",
      },
      { id: "lq2", text: "Rate the library staff helpfulness", type: "rating" },
      {
        id: "lq3",
        text: "What service needs most improvement?",
        type: "choice",
        options: [
          "E-book access",
          "Reading room capacity",
          "Internet speed",
          "Printing services",
          "Book availability",
        ],
      },
    ],
    createdBy: "Prof. James Carter",
    createdByRole: "faculty",
    isActive: true,
    responses: mockResponses(stdIds, stdNames, [
      { lq1: 4, lq2: 5, lq3: "E-book access" },
      { lq1: 3, lq2: 4, lq3: "Reading room capacity" },
    ]),
    createdAt: "2026-06-08T00:00:00Z",
  },
  {
    id: "srv-004",
    title: "Sports & Recreation Facilities Assessment",
    description:
      "Tell us how we can improve sports and recreational facilities at SAL Institute.",
    questions: [
      {
        id: "spq1",
        text: "Rate the current sports facilities quality",
        type: "rating",
      },
      {
        id: "spq2",
        text: "Which new sport/activity should we add?",
        type: "choice",
        options: [
          "Swimming Pool",
          "Gym Equipment",
          "Yoga Studio",
          "Table Tennis Room",
          "E-Sports Lab",
        ],
      },
      { id: "spq3", text: "Any other suggestions?", type: "text" },
    ],
    createdBy: "Campus Admin",
    createdByRole: "admin",
    isActive: false,
    responses: mockResponses(stdIds, stdNames, [
      { spq1: 3, spq2: "Gym Equipment", spq3: "Need 24/7 gym access." },
      { spq1: 4, spq2: "Swimming Pool", spq3: "A pool would be amazing!" },
      { spq1: 3, spq2: "E-Sports Lab", spq3: "E-Sports team competitions!" },
      { spq1: 5, spq2: "Yoga Studio", spq3: "Wellness programs are needed." },
    ]),
    createdAt: "2026-05-28T00:00:00Z",
  },
  {
    id: "srv-005",
    title: "Hostel Facilities Feedback",
    description:
      "Help us improve the hostel experience for students staying on campus.",
    questions: [
      {
        id: "hq1",
        text: "Rate overall hostel cleanliness and maintenance",
        type: "rating",
      },
      { id: "hq2", text: "Rate the quality of hostel food", type: "rating" },
      {
        id: "hq3",
        text: "Most urgent hostel issue?",
        type: "choice",
        options: [
          "WiFi speed",
          "Food quality",
          "Washroom maintenance",
          "Water supply",
          "Security",
        ],
      },
      { id: "hq4", text: "Additional feedback?", type: "text" },
    ],
    createdBy: "Campus Admin",
    createdByRole: "admin",
    isActive: true,
    responses: mockResponses(stdIds, stdNames, [
      {
        hq1: 3,
        hq2: 2,
        hq3: "Food quality",
        hq4: "More variety in dinner menu please.",
      },
      {
        hq1: 4,
        hq2: 3,
        hq3: "WiFi speed",
        hq4: "WiFi is very slow after 10 PM.",
      },
      {
        hq1: 2,
        hq2: 3,
        hq3: "Washroom maintenance",
        hq4: "Washrooms need urgent attention.",
      },
    ]),
    createdAt: "2026-06-05T00:00:00Z",
  },
];

function seedOnce(initKey: string, dataKey: string, seed: unknown[]) {
  if (!localStorage.getItem(initKey)) {
    ls_set(dataKey, seed);
    localStorage.setItem(initKey, "1");
  }
}

export function initCampusStore() {
  seedOnce(KEYS.usersInit, KEYS.users, SEED_USERS);
  seedOnce(KEYS.bookingsInit, KEYS.bookings, SEED_BOOKINGS);
  seedOnce(KEYS.eventsInit, KEYS.events, SEED_EVENTS);
  seedOnce(KEYS.noticesInit, KEYS.notices, SEED_NOTICES);
  seedOnce(KEYS.surveysInit, KEYS.surveys, SEED_SURVEYS);
}

export const campusUserStore = {
  getAll(): CampusUser[] {
    return ls<CampusUser[]>(KEYS.users, []);
  },
  getStaff(): CampusUser[] {
    return this.getAll().filter(
      (u) => (u.role === "faculty" || u.role === "maintenance") && u.isActive,
    );
  },
  getByRole(role: UserRole): CampusUser[] {
    return this.getAll().filter((u) => u.role === role);
  },
  create(data: Omit<CampusUser, "id" | "createdAt">): CampusUser {
    const user: CampusUser = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.push(user);
    ls_set(KEYS.users, all);
    return user;
  },
  toggleActive(id: string) {
    ls_set(
      KEYS.users,
      this.getAll().map((u) =>
        u.id === id ? { ...u, isActive: !u.isActive } : u,
      ),
    );
  },
};

export const bookingStore = {
  getAll(): Booking[] {
    return ls<Booking[]>(KEYS.bookings, []);
  },
  getByStudent(studentId: string): Booking[] {
    return this.getAll().filter((b) => b.studentId === studentId);
  },
  getPending(): Booking[] {
    return this.getAll().filter((b) => b.status === "Pending");
  },
  isSlotTaken(
    resource: string,
    date: string,
    timeSlot: string,
    excludeId?: string,
  ): boolean {
    return this.getAll().some(
      (b) =>
        b.resource === resource &&
        b.date === date &&
        b.timeSlot === timeSlot &&
        b.status === "Approved" &&
        b.id !== excludeId,
    );
  },
  create(data: Omit<Booking, "id" | "createdAt" | "status">): Booking {
    const b: Booking = {
      ...data,
      id: uid(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(b);
    ls_set(KEYS.bookings, all);
    return b;
  },
  approve(id: string, by: string): Booking | undefined {
    const all = this.getAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx]!, status: "Approved", managedBy: by };
    ls_set(KEYS.bookings, all);
    return all[idx];
  },
  reject(id: string, by: string, reason: string): Booking | undefined {
    const all = this.getAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    all[idx] = {
      ...all[idx]!,
      status: "Rejected",
      managedBy: by,
      rejectedReason: reason,
    };
    ls_set(KEYS.bookings, all);
    return all[idx];
  },
};

export const eventStore = {
  getAll(): CampusEvent[] {
    return ls<CampusEvent[]>(KEYS.events, []);
  },
  create(
    data: Omit<CampusEvent, "id" | "createdAt" | "attendees" | "savedBy">,
  ): CampusEvent {
    const e: CampusEvent = {
      ...data,
      id: uid(),
      attendees: [],
      savedBy: [],
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(e);
    ls_set(KEYS.events, all);
    return e;
  },
  update(id: string, patch: Partial<CampusEvent>) {
    ls_set(
      KEYS.events,
      this.getAll().map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  },
  delete(id: string) {
    ls_set(
      KEYS.events,
      this.getAll().filter((e) => e.id !== id),
    );
  },
  toggleAttend(id: string, studentId: string) {
    ls_set(
      KEYS.events,
      this.getAll().map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              attendees: e.attendees.includes(studentId)
                ? e.attendees.filter((a) => a !== studentId)
                : [...e.attendees, studentId],
            },
      ),
    );
  },
  toggleSave(id: string, studentId: string) {
    ls_set(
      KEYS.events,
      this.getAll().map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              savedBy: e.savedBy.includes(studentId)
                ? e.savedBy.filter((s) => s !== studentId)
                : [...e.savedBy, studentId],
            },
      ),
    );
  },
};

export const noticeStore = {
  getAll(): Notice[] {
    return ls<Notice[]>(KEYS.notices, []);
  },
  create(
    data: Omit<Notice, "id" | "createdAt" | "updatedAt" | "bookmarkedBy">,
  ): Notice {
    const n: Notice = {
      ...data,
      id: uid(),
      bookmarkedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(n);
    ls_set(KEYS.notices, all);
    return n;
  },
  update(id: string, patch: Partial<Notice>) {
    ls_set(
      KEYS.notices,
      this.getAll().map((n) =>
        n.id === id
          ? { ...n, ...patch, updatedAt: new Date().toISOString() }
          : n,
      ),
    );
  },
  delete(id: string) {
    ls_set(
      KEYS.notices,
      this.getAll().filter((n) => n.id !== id),
    );
  },
  toggleBookmark(id: string, studentId: string) {
    ls_set(
      KEYS.notices,
      this.getAll().map((n) =>
        n.id !== id
          ? n
          : {
              ...n,
              bookmarkedBy: n.bookmarkedBy.includes(studentId)
                ? n.bookmarkedBy.filter((b) => b !== studentId)
                : [...n.bookmarkedBy, studentId],
            },
      ),
    );
  },
};

export const surveyStore = {
  getAll(): Survey[] {
    return ls<Survey[]>(KEYS.surveys, []);
  },
  getActive(): Survey[] {
    return this.getAll().filter((s) => s.isActive);
  },
  create(data: Omit<Survey, "id" | "createdAt" | "responses">): Survey {
    const s: Survey = {
      ...data,
      id: uid(),
      responses: [],
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(s);
    ls_set(KEYS.surveys, all);
    return s;
  },
  respond(surveyId: string, response: SurveyResponse) {
    ls_set(
      KEYS.surveys,
      this.getAll().map((s) =>
        s.id === surveyId ? { ...s, responses: [...s.responses, response] } : s,
      ),
    );
  },
  hasResponded(surveyId: string, studentId: string): boolean {
    return !!this.getAll()
      .find((s) => s.id === surveyId)
      ?.responses.some((r) => r.studentId === studentId);
  },
  toggleActive(id: string) {
    ls_set(
      KEYS.surveys,
      this.getAll().map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s,
      ),
    );
  },
};
