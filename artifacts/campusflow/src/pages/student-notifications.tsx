import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNotifications } from "@/contexts/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Bookmark,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  Info,
  Package,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import type { NotificationType } from "@/lib/student-store";

const notifIcon: Record<
  NotificationType,
  React.ComponentType<{ className?: string }>
> = {
  issue_assigned: Wrench,
  status_changed: Info,
  issue_resolved: CheckCircle2,
  sos_update: ShieldAlert,
  new_notice: Bookmark,
  lost_found_match: Package,
  booking_approved: Calendar,
  booking_rejected: AlertTriangle,
  new_event: Bell,
};

const notifColor: Record<NotificationType, string> = {
  issue_assigned: "text-purple-400 bg-purple-500/10",
  status_changed: "text-blue-400 bg-blue-500/10",
  issue_resolved: "text-green-400 bg-green-500/10",
  sos_update: "text-red-400 bg-red-500/10",
  new_notice: "text-yellow-400 bg-yellow-500/10",
  lost_found_match: "text-orange-400 bg-orange-500/10",
  booking_approved: "text-green-400 bg-green-500/10",
  booking_rejected: "text-red-400 bg-red-500/10",
  new_event: "text-primary bg-primary/10",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function StudentNotifications() {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={markAllRead}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <CardContent>
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No notifications yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Notifications will appear here when your issues are updated or
                new events are posted.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, i) => {
              const Icon = notifIcon[notif.type] ?? Bell;
              const color =
                notifColor[notif.type] ?? "text-primary bg-primary/10";
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className={`glass-card cursor-pointer transition-all hover:border-primary/20 ${!notif.read ? "border-primary/30" : ""}`}
                    onClick={() => !notif.read && markRead(notif.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p
                                className={`text-sm font-medium ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {notif.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {notif.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timeAgo(notif.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
