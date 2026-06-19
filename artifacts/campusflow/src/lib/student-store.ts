export type IssueStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SosType = 'Medical Emergency' | 'Fire' | 'Security Threat' | 'Electrical Hazard' | 'Other';
export type LostFoundStatus = 'Reported' | 'Matched' | 'Claimed';
export type NotificationType =
  | 'issue_assigned'
  | 'status_changed'
  | 'issue_resolved'
  | 'sos_update'
  | 'new_notice'
  | 'lost_found_match'
  | 'booking_approved'
  | 'booking_rejected'
  | 'new_event';

export interface Issue {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: IssuePriority;
  department: string;
  photoBase64?: string;
  afterPhotoBase64?: string;
  resolutionNotes?: string;
  status: IssueStatus;
  statusHistory: Array<{ status: IssueStatus; timestamp: string; note?: string }>;
  rating?: { stars: number; comment: string };
  createdAt: string;
  updatedAt: string;
}

export interface SosAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: SosType;
  description: string;
  location: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  createdAt: string;
}

export interface LostFoundItem {
  id: string;
  reportType: 'lost' | 'found';
  studentId: string;
  studentName: string;
  itemName: string;
  description: string;
  photoBase64?: string;
  location: string;
  date: string;
  status: LostFoundStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ls<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function ls_set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

const KEYS = {
  issues: 'cf_issues',
  sos: 'cf_sos',
  lostFound: 'cf_lost_found',
  notifications: 'cf_notifications',
};

export const categorizeIssue = (
  title: string,
  description: string,
): { category: string; priority: IssuePriority; department: string } => {
  const text = (title + ' ' + description).toLowerCase();

  const rules: Array<{
    keywords: string[];
    category: string;
    priority: IssuePriority;
    department: string;
  }> = [
    {
      keywords: ['fire', 'smoke', 'flame', 'burn', 'extinguisher'],
      category: 'Fire Safety',
      priority: 'Critical',
      department: 'Security',
    },
    {
      keywords: ['water', 'leak', 'flood', 'pipe', 'tap', 'drain', 'sewage', 'toilet', 'bathroom'],
      category: 'Plumbing',
      priority: 'High',
      department: 'Maintenance',
    },
    {
      keywords: ['lift', 'elevator', 'escalator'],
      category: 'Elevator',
      priority: 'High',
      department: 'Maintenance',
    },
    {
      keywords: ['security', 'theft', 'steal', 'suspicious', 'trespassing', 'threat'],
      category: 'Security',
      priority: 'High',
      department: 'Security',
    },
    {
      keywords: ['fan', 'ac', 'air condition', 'cooling', 'light', 'bulb', 'switch', 'power', 'socket', 'wire', 'electrical', 'electricity'],
      category: 'Electrical',
      priority: 'Medium',
      department: 'Electrical',
    },
    {
      keywords: ['wifi', 'internet', 'network', 'connection', 'computer', 'laptop', 'projector', 'screen', 'printer'],
      category: 'IT Support',
      priority: 'Medium',
      department: 'IT Department',
    },
    {
      keywords: ['door', 'lock', 'key', 'window', 'gate', 'glass', 'roof', 'ceiling', 'wall', 'floor'],
      category: 'Infrastructure',
      priority: 'Medium',
      department: 'Maintenance',
    },
    {
      keywords: ['chair', 'table', 'furniture', 'desk', 'bench', 'board', 'whiteboard', 'cupboard'],
      category: 'Furniture',
      priority: 'Low',
      department: 'Housekeeping',
    },
    {
      keywords: ['garbage', 'waste', 'dirty', 'clean', 'hygiene', 'smell', 'odour', 'odor', 'cockroach', 'pest'],
      category: 'Sanitation',
      priority: 'Low',
      department: 'Housekeeping',
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return { category: rule.category, priority: rule.priority, department: rule.department };
    }
  }

  return { category: 'General', priority: 'Low', department: 'Administration' };
};

export const issueStore = {
  getAll(): Issue[] {
    return ls<Issue[]>(KEYS.issues, []);
  },
  getByStudent(studentId: string): Issue[] {
    return this.getAll().filter((i) => i.studentId === studentId);
  },
  getById(id: string): Issue | undefined {
    return this.getAll().find((i) => i.id === id);
  },
  create(data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'status'>): Issue {
    const now = new Date().toISOString();
    const issue: Issue = {
      ...data,
      id: uid(),
      status: 'Submitted',
      statusHistory: [{ status: 'Submitted', timestamp: now }],
      createdAt: now,
      updatedAt: now,
    };
    const all = this.getAll();
    all.unshift(issue);
    ls_set(KEYS.issues, all);
    return issue;
  },
  update(id: string, patch: Partial<Issue>): Issue | undefined {
    const all = this.getAll();
    const idx = all.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    const prev = all[idx]!;
    const updated: Issue = { ...prev, ...patch, updatedAt: new Date().toISOString() };
    if (patch.status && patch.status !== prev.status) {
      updated.statusHistory = [
        ...prev.statusHistory,
        { status: patch.status, timestamp: updated.updatedAt, note: patch.resolutionNotes },
      ];
    }
    all[idx] = updated;
    ls_set(KEYS.issues, all);
    return updated;
  },
  addRating(id: string, stars: number, comment: string): Issue | undefined {
    return this.update(id, { rating: { stars, comment } });
  },
};

export const sosStore = {
  getAll(): SosAlert[] {
    return ls<SosAlert[]>(KEYS.sos, []);
  },
  getByStudent(studentId: string): SosAlert[] {
    return this.getAll().filter((s) => s.studentId === studentId);
  },
  create(data: Omit<SosAlert, 'id' | 'createdAt' | 'status'>): SosAlert {
    const alert: SosAlert = {
      ...data,
      id: uid(),
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(alert);
    ls_set(KEYS.sos, all);
    return alert;
  },
};

export const lostFoundStore = {
  getAll(): LostFoundItem[] {
    return ls<LostFoundItem[]>(KEYS.lostFound, []);
  },
  getByStudent(studentId: string): LostFoundItem[] {
    return this.getAll().filter((i) => i.studentId === studentId);
  },
  create(data: Omit<LostFoundItem, 'id' | 'createdAt' | 'status'>): LostFoundItem {
    const item: LostFoundItem = {
      ...data,
      id: uid(),
      status: 'Reported',
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(item);
    ls_set(KEYS.lostFound, all);
    return item;
  },
};

export const notificationStore = {
  getAll(): AppNotification[] {
    return ls<AppNotification[]>(KEYS.notifications, []);
  },
  getByUser(userId: string): AppNotification[] {
    return this.getAll().filter((n) => n.userId === userId);
  },
  getUnreadCount(userId: string): number {
    return this.getByUser(userId).filter((n) => !n.read).length;
  },
  add(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const n: AppNotification = {
      ...data,
      id: uid(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    const all = this.getAll();
    all.unshift(n);
    ls_set(KEYS.notifications, all);
    return n;
  },
  markRead(id: string) {
    const all = this.getAll();
    const idx = all.findIndex((n) => n.id === id);
    if (idx !== -1) {
      all[idx]!.read = true;
      ls_set(KEYS.notifications, all);
    }
  },
  markAllRead(userId: string) {
    const all = this.getAll().map((n) => (n.userId === userId ? { ...n, read: true } : n));
    ls_set(KEYS.notifications, all);
  },
};
