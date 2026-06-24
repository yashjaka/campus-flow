import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { bookingStore, type Booking } from "@/lib/campus-store";
import { notificationStore } from "@/lib/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  User,
  X,
  Search,
} from "lucide-react";

const statusColor: Record<Booking["status"], string> = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function BookingManage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(() =>
    bookingStore.getAll(),
  );
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => setBookings(bookingStore.getAll()), []);

  const pending = bookings.filter((b) => b.status === "Pending");
  const all = bookings.filter((b) => {
    if (!search) return true;
    return (
      b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.resource.toLowerCase().includes(search.toLowerCase())
    );
  });

  const approve = (b: Booking) => {
    if (!user) return;
    bookingStore.approve(b.id, user.name);
    notificationStore.add({
      userId: b.studentId,
      type: "booking_approved",
      title: "Booking Approved ✓",
      message: `Your booking for ${b.resource} on ${b.date} (${b.timeSlot}) has been approved by ${user.name}.`,
      link: "/student/booking",
    });
    refresh();
  };

  const confirmReject = () => {
    if (!rejectTarget || !user) return;
    bookingStore.reject(
      rejectTarget.id,
      user.name,
      rejectReason || "No reason provided",
    );
    notificationStore.add({
      userId: rejectTarget.studentId,
      type: "booking_rejected",
      title: "Booking Rejected",
      message: `Your booking for ${rejectTarget.resource} on ${rejectTarget.date} was rejected. Reason: ${rejectReason || "No reason provided"}.`,
      link: "/student/booking",
    });
    setRejectTarget(null);
    setRejectReason("");
    refresh();
  };

  const BookingCard = ({
    b,
    showActions,
  }: {
    b: Booking;
    showActions?: boolean;
  }) => (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className={`text-xs border ${statusColor[b.status]}`}>
                {b.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(b.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-semibold">{b.resource}</h3>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {b.studentName}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {b.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {b.timeSlot}
              </span>
            </div>
            {b.purpose && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {b.purpose}
              </p>
            )}
            {b.rejectedReason && (
              <p className="text-xs text-red-400 mt-1">
                Reason: {b.rejectedReason}
              </p>
            )}
            {b.managedBy && (
              <p className="text-xs text-muted-foreground mt-1">
                By: {b.managedBy}
              </p>
            )}
          </div>
          {showActions && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white gap-1"
                onClick={() => approve(b)}
              >
                <CheckCircle2 className="h-3 w-3" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1"
                onClick={() => {
                  setRejectTarget(b);
                  setRejectReason("");
                }}
              >
                <X className="h-3 w-3" /> Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Booking Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage facility booking requests.
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Bookings ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pending.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">
                    No pending booking requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pending.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BookingCard b={b} showActions />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or resource..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {all.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <BookingCard b={b} showActions={b.status === "Pending"} />
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {rejectTarget && (
              <p className="text-sm text-muted-foreground">
                Rejecting: <strong>{rejectTarget.resource}</strong> on{" "}
                {rejectTarget.date} for {rejectTarget.studentName}
              </p>
            )}
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Provide a reason for rejection..."
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmReject}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
