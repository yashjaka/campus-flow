import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { issueStore, type Issue } from "@/lib/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Wrench,
} from "lucide-react";

const statusColor: Record<string, string> = {
  Submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Under Review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Assigned: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "In Progress": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Resolved: "bg-green-500/20 text-green-400 border-green-500/30",
};
const priorityColor: Record<string, string> = {
  Low: "text-gray-400",
  Medium: "text-yellow-400",
  High: "text-orange-400",
  Critical: "text-red-400",
};

export default function MaintenanceDashboard() {
  const { user } = useAuth();

  const allIssues = issueStore.getAll();
  const myTasks: Issue[] = allIssues.filter(
    (i) => i.assignedTo?.name === user?.name,
  );
  const pending = myTasks.filter((i) => i.status !== "Resolved");
  const completed = myTasks.filter((i) => i.status === "Resolved");
  const critical = myTasks.filter(
    (i) => i.priority === "Critical" && i.status !== "Resolved",
  );

  const recent = [...pending]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your maintenance task overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Assigned Tasks",
              value: myTasks.length,
              icon: Wrench,
              color: "text-purple-400",
              sub: "Total assigned to you",
            },
            {
              label: "Pending",
              value: pending.length,
              icon: Clock,
              color: "text-yellow-400",
              sub: `${critical.length} critical`,
            },
            {
              label: "Completed",
              value: completed.length,
              icon: CheckCircle2,
              color: "text-green-400",
              sub: "Resolved issues",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {s.label}
                  </CardTitle>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Critical Alert */}
        {critical.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="glass-card border-red-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-400">
                    {critical.length} critical task
                    {critical.length > 1 ? "s" : ""} require immediate attention
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please resolve these as soon as possible.
                  </p>
                </div>
                <Link href="/complaints" className="ml-auto">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    View
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pending Tasks</h2>
            <Link href="/complaints">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                All tasks <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {recent.length === 0 ? (
            <Card className="glass-card text-center py-10">
              <CardContent>
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">All clear!</h3>
                <p className="text-sm text-muted-foreground">
                  No pending tasks assigned to you.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {recent.map((issue) => (
                    <Link key={issue.id} href="/complaints">
                      <div className="flex items-start justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge
                              className={`text-xs border ${statusColor[issue.status] ?? ""}`}
                            >
                              {issue.status}
                            </Badge>
                            <span
                              className={`text-xs font-medium ${priorityColor[issue.priority] ?? ""}`}
                            >
                              {issue.priority}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {issue.location} · {issue.category}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Events & Notices quick links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold mb-3">Campus Info</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/notices">
              <Card className="glass-card cursor-pointer hover:border-primary/30 transition-all">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-semibold">📋 Notices</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    View official announcements
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/events">
              <Card className="glass-card cursor-pointer hover:border-primary/30 transition-all">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-semibold">📅 Events</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Browse campus events
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
