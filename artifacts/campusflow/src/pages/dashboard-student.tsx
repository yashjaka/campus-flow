import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { issueStore, sosStore } from "@/lib/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  MessageSquareWarning,
  Package,
  Shield,
  Wrench,
} from "lucide-react";

const statusColor: Record<string, string> = {
  Submitted: "bg-blue-500/20 text-blue-400",
  "Under Review": "bg-yellow-500/20 text-yellow-400",
  Assigned: "bg-purple-500/20 text-purple-400",
  "In Progress": "bg-orange-500/20 text-orange-400",
  Resolved: "bg-green-500/20 text-green-400",
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const myIssues = user ? issueStore.getByStudent(user.id) : [];
  const openIssues = myIssues.filter((i) => i.status !== "Resolved");
  const recentIssues = myIssues.slice(0, 3);
  const myAlerts = user ? sosStore.getByStudent(user.id) : [];
  const activeAlerts = myAlerts.filter((a) => a.status === "Active");

  const modules = [
    {
      name: "My Issues",
      description: "Report & track campus issues",
      href: "/student/issues",
      icon: MessageSquareWarning,
      color: "text-purple-400",
      bg: "bg-purple-500/10 hover:bg-purple-500/20",
      stat: openIssues.length > 0 ? `${openIssues.length} open` : null,
    },
    {
      name: "SOS Emergency",
      description: "Report emergencies instantly",
      href: "/student/sos",
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10 hover:bg-red-500/20",
      stat: activeAlerts.length > 0 ? `${activeAlerts.length} active` : null,
    },
    {
      name: "Lost & Found",
      description: "Browse and report items",
      href: "/student/lost-found",
      icon: Package,
      color: "text-orange-400",
      bg: "bg-orange-500/10 hover:bg-orange-500/20",
      stat: null,
    },
    {
      name: "Notifications",
      description: "Updates and alerts",
      href: "/student/notifications",
      icon: Bell,
      color: "text-primary",
      bg: "bg-primary/10 hover:bg-primary/20",
      stat: unreadCount > 0 ? `${unreadCount} new` : null,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's your campus overview.</p>
        </div>

        {/* Academic Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground mt-1">Current semester</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">Due this week</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Next Class</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10:00 AM</div>
                <p className="text-xs text-muted-foreground mt-1">Computer Science 101</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Campus Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Campus Services</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Link href={mod.href}>
                  <Card className={`glass-card cursor-pointer transition-all border-transparent hover:border-white/10 ${mod.bg}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center`}>
                          <mod.icon className={`h-5 w-5 ${mod.color}`} />
                        </div>
                        {mod.stat && (
                          <Badge className="text-xs bg-white/10 text-foreground">{mod.stat}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{mod.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        {recentIssues.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recent Issues</h2>
              <Link href="/student/issues">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {recentIssues.map((issue) => (
                    <Link key={issue.id} href="/student/issues">
                      <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{issue.title}</p>
                            <p className="text-xs text-muted-foreground">{issue.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${statusColor[issue.status] ?? ""}`}>{issue.status}</Badge>
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

        {/* Quick SOS */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-card border-red-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Campus Emergency?</h3>
                  <p className="text-xs text-muted-foreground">Tap SOS to alert campus security instantly.</p>
                </div>
              </div>
              <Link href="/student/sos">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold">
                  SOS
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
