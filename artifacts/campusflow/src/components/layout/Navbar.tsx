import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, Menu, Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { useLocation } from "wouter";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const recentNotifs = notifications.slice(0, 5);
  const isStudent = user?.role === "student";

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 h-16">
      <div className="flex items-center gap-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 glass-sidebar border-none">
            <Sidebar onNavClick={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center glow-primary">
            <div className="w-4 h-4 rounded-sm bg-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight gradient-text hidden sm:inline-block">CampusFlow</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {isStudent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 glass-card" align="end">
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              {recentNotifs.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No notifications</div>
              ) : (
                recentNotifs.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`flex flex-col items-start gap-0.5 p-3 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                    onClick={() => {
                      markRead(n.id);
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">{n.message}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-center justify-center text-xs text-primary cursor-pointer"
                onClick={() => navigate("/student/notifications")}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 flex items-center gap-2 rounded-full px-2 hover:bg-white/5">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-medium leading-none">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2 sm:hidden">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
