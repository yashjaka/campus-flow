import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, ShieldCheck, Wrench, Activity, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: activities, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutional Overview</h1>
          <p className="text-muted-foreground mt-1">System-wide statistics and recent activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents}
            loading={statsLoading}
            icon={GraduationCap}
            delay={0.1}
          />
          <StatCard
            title="Faculty Members"
            value={stats?.totalFaculty}
            loading={statsLoading}
            icon={Users}
            delay={0.2}
          />
          <StatCard
            title="Maintenance Staff"
            value={stats?.totalMaintenance}
            loading={statsLoading}
            icon={Wrench}
            delay={0.3}
          />
          <StatCard
            title="System Admins"
            value={stats?.totalAdmins}
            loading={statsLoading}
            icon={ShieldCheck}
            delay={0.4}
          />
          <StatCard
            title="Recent Registrations"
            value={stats?.recentRegistrations}
            loading={statsLoading}
            icon={UserPlus}
            delay={0.5}
            className="border-primary/50 bg-primary/5"
          />
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <CardDescription>Latest actions performed across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <Skeleton className="h-2 w-2 rounded-full mt-2" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity, i) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <span className="font-medium text-foreground/70">{activity.actor}</span>
                          <span>•</span>
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No recent activity found.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, loading, icon: Icon, delay, className = "" }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className={`glass-card ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{value || 0}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}