import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { eventStore, EVENT_TYPES, type CampusEvent } from "@/lib/campus-store";
import { notificationStore } from "@/lib/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Clock, Edit2, Loader2, MapPin, Plus, Search, Star, Trash2, Users, Zap } from "lucide-react";

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Workshop: BookOpen, Seminar: BookOpen, 'Cultural Event': Star, 'Sports Event': Zap, Hackathon: Zap,
};
const typeColor: Record<string, string> = {
  Workshop: 'bg-blue-500/20 text-blue-400', Seminar: 'bg-purple-500/20 text-purple-400',
  'Cultural Event': 'bg-pink-500/20 text-pink-400', 'Sports Event': 'bg-orange-500/20 text-orange-400',
  Hackathon: 'bg-green-500/20 text-green-400',
};

const emptyForm = { title: '', description: '', type: EVENT_TYPES[0] as string, date: '', time: '', venue: '' };

export default function Events() {
  const { user } = useAuth();
  const isStaff = user?.role === 'faculty' || user?.role === 'admin';
  const [events, setEvents] = useState<CampusEvent[]>(() => eventStore.getAll());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(() => setEvents(eventStore.getAll()), []);

  const filtered = events.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || e.type === typeFilter;
    return matchSearch && matchType;
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (e: CampusEvent) => { setEditing(e.id); setForm({ title: e.title, description: e.description, type: e.type, date: e.date, time: e.time, venue: e.venue }); setDialogOpen(true); };

  const handleSave = () => {
    if (!user || !form.title || !form.date) return;
    setSaving(true);
    setTimeout(() => {
      if (editing) {
        eventStore.update(editing, form);
      } else {
        const ev = eventStore.create({ ...form, createdBy: user.name, createdByRole: user.role });
        // notify all students (stored users) about new event
        notificationStore.add({ userId: 'broadcast', type: 'new_event', title: `New Event: ${ev.title}`, message: `${ev.type} on ${ev.date} at ${ev.venue}. Register now!`, link: '/events' });
      }
      refresh();
      setSaving(false);
      setDialogOpen(false);
    }, 400);
  };

  const handleDelete = (id: string) => {
    eventStore.delete(id);
    refresh();
  };

  const toggleAttend = (id: string) => {
    if (!user) return;
    eventStore.toggleAttend(id, user.id);
    refresh();
  };

  const toggleSave = (id: string) => {
    if (!user) return;
    eventStore.toggleSave(id, user.id);
    refresh();
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Hub</h1>
            <p className="text-muted-foreground mt-1">Browse and manage campus events.</p>
          </div>
          {isStaff && (
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Create Event</Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', ...EVENT_TYPES].map(t => (
              <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(t)}>{t}</Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No events found</h3>
              <p className="text-sm text-muted-foreground">{isStaff ? 'Create the first event!' : 'Check back soon for upcoming events.'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev, i) => {
              const Icon = typeIcon[ev.type] ?? Calendar;
              const isAttending = user ? ev.attendees.includes(user.id) : false;
              const isSaved = user ? ev.savedBy.includes(user.id) : false;
              const isOwn = ev.createdBy === user?.name;
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="glass-card flex flex-col h-full hover:border-primary/20 transition-all">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`text-xs ${typeColor[ev.type] ?? 'bg-muted/20 text-muted-foreground'}`}>
                          <Icon className="h-3 w-3 mr-1" />{ev.type}
                        </Badge>
                        {isStaff && isOwn && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ev)}><Edit2 className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ev.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-base mb-2 flex-1">{ev.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ev.description}</p>
                      <div className="space-y-1 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{ev.date} at {ev.time}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{ev.venue}</div>
                        <div className="flex items-center gap-1.5"><Users className="h-3 w-3" />{ev.attendees.length} registered</div>
                        <div>By {ev.createdBy} · {ev.createdByRole}</div>
                      </div>
                      {user?.role === 'student' && (
                        <div className="flex gap-2 mt-auto">
                          <Button size="sm" variant={isAttending ? 'default' : 'outline'} className="flex-1" onClick={() => toggleAttend(ev.id)}>
                            {isAttending ? '✓ Registered' : 'Register'}
                          </Button>
                          <Button size="sm" variant={isSaved ? 'secondary' : 'outline'} onClick={() => toggleSave(ev.id)}>
                            {isSaved ? '★' : '☆'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Event' : 'Create New Event'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Event description..." rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Venue</Label><Input placeholder="e.g. Auditorium" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title || !form.date} className="flex-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editing ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
