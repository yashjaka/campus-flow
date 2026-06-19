import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { bookingStore, RESOURCES, TIME_SLOTS, type Booking } from "@/lib/campus-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CalendarDays, CheckCircle2, Clock, Loader2, MapPin, X } from "lucide-react";

const statusColor: Record<Booking['status'], string> = {
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const RESOURCE_COLORS = ['bg-purple-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-orange-500/20', 'bg-pink-500/20', 'bg-cyan-500/20', 'bg-yellow-500/20'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function CalendarView({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const approvedBookings = bookings.filter(b => b.status === 'Approved');
  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return approvedBookings.filter(b => b.date === dateStr);
  };

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : null;
  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => { const d = new Date(year, month - 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }}>‹ Prev</Button>
        <span className="font-semibold">{monthName}</span>
        <Button variant="outline" size="sm" onClick={() => { const d = new Date(year, month + 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }}>Next ›</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-xs text-muted-foreground py-1 font-medium">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const dayBookings = getBookingsForDay(day);
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = day === selectedDay;
          return (
            <button key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
              className={`relative p-1.5 rounded-lg text-sm transition-all min-h-[40px] ${isSelected ? 'ring-2 ring-primary bg-primary/10' : isToday ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-muted/20'}`}>
              {day}
              {dayBookings.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayBookings.slice(0, 3).map((_, j) => (
                    <span key={j} className={`w-1 h-1 rounded-full ${RESOURCE_COLORS[j % RESOURCE_COLORS.length]?.replace('/20', '/80') ?? 'bg-primary'}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{selectedDateStr} — Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDayBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approved bookings on this day.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-2 bg-muted/10 rounded-lg text-sm">
                        <div>
                          <p className="font-medium">{b.resource}</p>
                          <p className="text-xs text-muted-foreground">{b.timeSlot} · {b.studentName}</p>
                        </div>
                        <Badge className="text-xs border bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudentBooking() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [myBookings, setMyBookings] = useState<Booking[]>(() => user ? bookingStore.getByStudent(user.id) : []);
  const [allBookings] = useState<Booking[]>(() => bookingStore.getAll());

  const [form, setForm] = useState({ resource: '', date: '', timeSlot: '', purpose: '' });
  const [conflict, setConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const refresh = useCallback(() => { if (user) setMyBookings(bookingStore.getByStudent(user.id)); }, [user]);

  const checkConflict = (resource: string, date: string, timeSlot: string) => {
    if (resource && date && timeSlot) setConflict(bookingStore.isSlotTaken(resource, date, timeSlot));
    else setConflict(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || conflict) return;
    setSubmitting(true);
    setTimeout(() => {
      bookingStore.create({ studentId: user.id, studentName: user.name, resource: form.resource, date: form.date, timeSlot: form.timeSlot, purpose: form.purpose });
      addNotification({ type: 'booking_approved', title: 'Booking Request Submitted', message: `Your request for ${form.resource} on ${form.date} (${form.timeSlot}) is pending approval.`, link: '/student/booking' });
      refresh();
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setForm({ resource: '', date: '', timeSlot: '', purpose: '' }); }, 2500);
    }, 500);
  };

  const today = new Date().toISOString().split('T')[0] ?? '';

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Booking</h1>
          <p className="text-muted-foreground mt-1">Book campus facilities for academic and co-curricular activities.</p>
        </div>

        <Tabs defaultValue="my">
          <TabsList>
            <TabsTrigger value="my">My Bookings ({myBookings.length})</TabsTrigger>
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-4">
            {myBookings.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No bookings yet</h3>
                  <p className="text-sm text-muted-foreground">Submit a booking request to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myBookings.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs border ${statusColor[b.status]}`}>{b.status}</Badge>
                            </div>
                            <h3 className="font-semibold">{b.resource}</h3>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{b.date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.timeSlot}</span>
                            </div>
                            {b.purpose && <p className="text-xs text-muted-foreground mt-1">{b.purpose}</p>}
                            {b.rejectedReason && <p className="text-xs text-red-400 mt-1">Reason: {b.rejectedReason}</p>}
                            {b.managedBy && <p className="text-xs text-muted-foreground mt-1">Managed by: {b.managedBy}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <Card className="glass-card max-w-lg">
              <CardHeader><CardTitle>New Booking Request</CardTitle></CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-8 text-center">
                      <CheckCircle2 className="h-14 w-14 text-green-400" />
                      <h3 className="text-lg font-semibold text-green-400">Request Submitted!</h3>
                      <p className="text-sm text-muted-foreground">Awaiting approval from faculty or admin.</p>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Resource *</Label>
                        <Select value={form.resource} onValueChange={v => { setForm(f => ({ ...f, resource: v })); checkConflict(v, form.date, form.timeSlot); }}>
                          <SelectTrigger><SelectValue placeholder="Select a resource" /></SelectTrigger>
                          <SelectContent>{RESOURCES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Input type="date" min={today} value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); checkConflict(form.resource, e.target.value, form.timeSlot); }} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Time Slot *</Label>
                        <Select value={form.timeSlot} onValueChange={v => { setForm(f => ({ ...f, timeSlot: v })); checkConflict(form.resource, form.date, v); }}>
                          <SelectTrigger><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                          <SelectContent>{TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {conflict && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                          <X className="h-4 w-4 flex-shrink-0" />
                          This slot is already booked for the selected resource.
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Purpose / Description</Label>
                        <Textarea placeholder="Briefly describe the purpose of this booking..." rows={2} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                      </div>
                      <Button type="submit" disabled={submitting || conflict || !form.resource || !form.date || !form.timeSlot} className="w-full">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Submit Request
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base">Facility Booking Calendar</CardTitle></CardHeader>
              <CardContent><CalendarView bookings={allBookings} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
