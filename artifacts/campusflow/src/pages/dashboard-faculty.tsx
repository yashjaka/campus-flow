import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { issueStore } from "@/lib/student-store";
import {
  bookingStore,
  eventStore,
  noticeStore,
  surveyStore,
} from "@/lib/campus-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  BarChart2,
  MessageSquareWarning,
  Megaphone,
} from "lucide-react";

const statusColor: Record<string, string> = {
  Submitted: "bg-blue-500/20 text-blue-400",
  "Under Review": "bg-yellow-500/20 text-yellow-400",
  Assigned: "bg-purple-500/20 text-purple-400",
  "In Progress": "bg-orange-500/20 text-orange-400",
  Resolved: "bg-green-500/20 text-green-400",
};

export default function FacultyDashboard() {
  const { user } = useAuth();

  const allIssues = issueStore.getAll();
  const openIssues = allIssues.filter((i) => i.status !== "Resolved");

  const pendingBookings = bookingStore.getPending().length;
  const myEvents = eventStore
    .getAll()
    .filter((e) => e.createdBy === user?.name);
  const noticeCount = noticeStore.getAll().length;
  const activeSurveys = surveyStore.getActive().length;

  const recentIssues = [...allIssues]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const moduleCards = [
    {
      label: "Open Complaints",
      value: openIssues.length,
      icon: MessageSquareWarning,
      color: "text-purple-400",
      href: "/complaints",
      sub: "Needs review",
    },
    {
      label: "Pending Bookings",
      value: pendingBookings,
      icon: CalendarDays,
      color: "text-yellow-400",
      href: "/bookings/manage",
      sub: "Awaiting approval",
    },
    {
      label: "My Events",
      value: myEvents.length,
      icon: BookOpen,
      color: "text-green-400",
      href: "/events",
      sub: "Events created by you",
    },
    {
      label: "Notices",
      value: noticeCount,
      icon: Megaphone,
      color: "text-blue-400",
      href: "/notices",
      sub: `${activeSurveys} active surveys`,
    },
    {
      label: "Surveys",
      value: activeSurveys,
      icon: BarChart2,
      color: "text-orange-400",
      href: "/surveys",
      sub: "Collect feedback",
    },
    {
      label: "All Issues",
      value: allIssues.length,
      icon: FileText,
      color: "text-muted-foreground",
      href: "/complaints",
      sub: `${allIssues.filter((i) => i.status === "Resolved").length} resolved`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Faculty portal — manage complaints, bookings, events and more.
          </p>
        </div>

        {/* Module Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleCards.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={m.href}>
                <Card className="glass-card cursor-pointer hover:border-primary/30 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {m.label}
                    </CardTitle>
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${m.color}`}>
                      {m.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.sub}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Complaints */}
        {recentIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recent Complaints</h2>
              <Link href="/complaints">
                <span className="text-sm text-primary flex items-center gap-1 hover:underline cursor-pointer">
                  View all <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {recentIssues.map((issue) => (
                    <Link key={issue.id} href="/complaints">
                      <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-medium">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {issue.studentName} · {issue.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs border ${statusColor[issue.status] ?? ""}`}
                          >
                            {issue.status}
                          </Badge>
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

        {/* Booking Approvals CTA */}
        {pendingBookings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Link href="/bookings/manage">
              <Card className="glass-card border-yellow-500/20 cursor-pointer hover:border-yellow-500/40 transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="font-semibold">
                        {pendingBookings} booking request
                        {pendingBookings > 1 ? "s" : ""} pending
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Approve or reject student resource bookings
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
