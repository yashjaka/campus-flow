import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { issueStore } from "@/lib/student-store";
import { campusUserStore, bookingStore, eventStore, noticeStore, surveyStore } from "@/lib/campus-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  AlertCircle, BookOpen, CalendarDays, ChevronRight, ClipboardList,
  FileText, MessageSquareWarning, Megaphone, BarChart2, Users, Wrench,
} from "lucide-react";

const statusColor: Record<string, string> = {
  Submitted: "bg-blue-500/20 text-blue-400",
  "Under Review": "bg-yellow-500/20 text-yellow-400",
  Assigned: "bg-purple-500/20 text-purple-400",
  "In Progress": "bg-orange-500/20 text-orange-400",
  Resolved: "bg-green-500/20 text-green-400",
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const allIssues = issueStore.getAll();
  const openIssues = allIssues.filter(i => i.status !== "Resolved");
  const criticalIssues = allIssues.filter(i => i.priority === "Critical" && i.status !== "Resolved");

  const allUsers = campusUserStore.getAll();
  const studentCount = allUsers.filter(u => u.role === "student").length;
  const facultyCount = allUsers.filter(u => u.role === "faculty").length;
  const maintenanceCount = allUsers.filter(u => u.role === "maintenance").length;

  const allBookings = bookingStore.getAll();
  const pendingBookings = allBookings.filter(b => b.status === "Pending").length;
  const approvedBookings = allBookings.filter(b => b.status === "Approved").length;

  const eventCount = eventStore.getAll().length;
  const noticeCount = noticeStore.getAll().length;
  const surveyCount = surveyStore.getAll().length;

  const recentIssues = [...allIssues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const statsCards = [
    { label: "Total Complaints", value: allIssues.length, sub: `${openIssues.length} open`, icon: MessageSquareWarning, color: "text-purple-400", href: "/complaints" },
    { label: "Critical Issues", value: criticalIssues.length, sub: "Needs immediate attention", icon: AlertCircle, color: "text-red-400", href: "/complaints" },
    { label: "Total Users", value: allUsers.length, sub: `${studentCount} students · ${facultyCount} faculty`, icon: Users, color: "text-blue-400", href: "/admin/users" },
    { label: "Pending Bookings", value: pendingBookings, sub: `${approvedBookings} approved`, icon: CalendarDays, color: "text-yellow-400", href: "/bookings/manage" },
    { label: "Events", value: eventCount, sub: `${noticeCount} notices published`, icon: BookOpen, color: "text-green-400", href: "/events" },
    { label: "Surveys", value: surveyCount, sub: "Active feedback forms", icon: BarChart2, color: "text-orange-400", href: "/surveys" },
  ];

  const quickLinks = [
    { name: "Complaint Management", href: "/complaints", icon: MessageSquareWarning, desc: `${openIssues.length} open complaints` },
    { name: "User Management", href: "/admin/users", icon: Users, desc: `${allUsers.length} total users` },
    { name: "Booking Approvals", href: "/bookings/manage", icon: CalendarDays, desc: `${pendingBookings} pending` },
    { name: "Notice Board", href: "/notices", icon: Megaphone, desc: `${noticeCount} notices` },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Campus administration overview — all systems at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link href={s.href}>
                <Card className="glass-card cursor-pointer hover:border-primary/30 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((l, i) => (
              <motion.div key={l.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}>
                <Link href={l.href}>
                  <Card className="glass-card cursor-pointer hover:border-primary/30 transition-all">
                    <CardContent className="p-4">
                      <l.icon className="h-5 w-5 text-primary mb-2" />
                      <h3 className="font-semibold text-sm">{l.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* User Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 className="text-lg font-semibold mb-3">User Breakdown</h2>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Students", count: studentCount, color: "text-green-400" },
                  { label: "Faculty", count: facultyCount, color: "text-blue-400" },
                  { label: "Maintenance", count: maintenanceCount, color: "text-orange-400" },
                  { label: "Admins", count: allUsers.filter(u => u.role === "admin").length, color: "text-purple-400" },
                ].map(r => (
                  <div key={r.label}>
                    <div className={`text-3xl font-bold ${r.color}`}>{r.count}</div>
                    <div className="text-xs text-muted-foreground mt-1">{r.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Complaints */}
        {recentIssues.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recent Complaints</h2>
              <Link href="/complaints">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ChevronRight className="h-3 w-3" /></Button>
              </Link>
            </div>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {recentIssues.map(issue => (
                    <Link key={issue.id} href="/complaints">
                      <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{issue.title}</p>
                            <p className="text-xs text-muted-foreground">{issue.studentName} · {issue.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs border ${statusColor[issue.status] ?? ""}`}>{issue.status}</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
