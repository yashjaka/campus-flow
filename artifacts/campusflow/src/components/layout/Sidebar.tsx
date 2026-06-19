import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, BarChart2, BookOpen, CalendarDays, ClipboardList,
  GraduationCap, LayoutDashboard, Megaphone, MessageSquareWarning,
  Package, Settings, Users, Bell, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { Badge } from "@/components/ui/badge";

interface NavItem { name: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: number; }

interface SidebarProps { onNavClick?: () => void; }

export function Sidebar({ onNavClick }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  const role = user.role;

  const sharedModules: NavItem[] = [
    { name: "Events", href: "/events", icon: BookOpen },
    { name: "Notice Board", href: "/notices", icon: Megaphone },
    { name: "Surveys", href: "/surveys", icon: BarChart2 },
  ];

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "student":
        return [
          { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
          { name: "My Issues", href: "/student/issues", icon: MessageSquareWarning },
          { name: "SOS Emergency", href: "/student/sos", icon: AlertTriangle },
          { name: "Lost & Found", href: "/student/lost-found", icon: Package },
          { name: "Resource Booking", href: "/student/booking", icon: CalendarDays },
          ...sharedModules,
          { name: "Notifications", href: "/student/notifications", icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        ];
      case "faculty":
        return [
          { name: "Dashboard", href: "/dashboard/faculty", icon: LayoutDashboard },
          { name: "Complaints", href: "/complaints", icon: MessageSquareWarning },
          { name: "Booking Approvals", href: "/bookings/manage", icon: CalendarDays },
          ...sharedModules,
        ];
      case "maintenance":
        return [
          { name: "Dashboard", href: "/dashboard/maintenance", icon: LayoutDashboard },
          { name: "My Tasks", href: "/complaints", icon: Wrench },
          ...sharedModules,
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
          { name: "Complaints", href: "/complaints", icon: MessageSquareWarning },
          { name: "User Management", href: "/admin/users", icon: Users },
          { name: "Booking Approvals", href: "/bookings/manage", icon: CalendarDays },
          ...sharedModules,
          { name: "Students", href: "/admin/students", icon: GraduationCap },
          { name: "Staff", href: "/admin/staff", icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-full py-4 gap-4">
      <div className="px-6 mb-4 md:hidden">
        <span className="text-xl font-bold tracking-tight gradient-text">CampusFlow</span>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 transition-all",
                  isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-white/5",
                )}
                onClick={onNavClick}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium flex-1 text-left">{item.name}</span>
                {item.badge ? (
                  <Badge className="h-5 min-w-5 px-1.5 text-xs bg-primary text-primary-foreground flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                ) : null}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
