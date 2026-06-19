import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { notificationStore, type AppNotification, type NotificationType } from "@/lib/student-store";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (data: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setNotifications(notificationStore.getByUser(user.id));
  }, [user]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const addNotification = useCallback(
    (data: { type: NotificationType; title: string; message: string; link?: string }) => {
      if (!user) return;
      notificationStore.add({ ...data, userId: user.id });
      refresh();
    },
    [user, refresh],
  );

  const markRead = useCallback(
    (id: string) => {
      notificationStore.markRead(id);
      refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(() => {
    if (!user) return;
    notificationStore.markAllRead(user.id);
    refresh();
  }, [user, refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markRead, markAllRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
