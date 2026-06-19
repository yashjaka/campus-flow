import { useState, useRef, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { issueStore, notificationStore, type Issue, type IssueStatus, type IssuePriority } from "@/lib/student-store";
import { campusUserStore } from "@/lib/campus-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  AlertCircle, Camera, CheckCircle2, ChevronRight, Clock,
  Filter, Loader2, Search, User, Wrench,
} from "lucide-react";

const STATUS_ORDER: IssueStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
const statusColor: Record<IssueStatus, string> = {
  Submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Under Review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Assigned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'In Progress': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
};
const priorityColor: Record<IssuePriority, string> = {
  Low: 'bg-gray-500/20 text-gray-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  High: 'bg-orange-500/20 text-orange-400',
  Critical: 'bg-red-500/20 text-red-400',
};

function ImageUpload({ label, value, onChange }: { label: string; value?: string; onChange: (b: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label className="text-xs mb-1 block">{label}</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors text-center" onClick={() => ref.current?.click()}>
        {value ? <img src={value} alt="photo" className="max-h-32 mx-auto rounded object-contain" /> :
          <div className="flex flex-col items-center gap-1 text-muted-foreground"><Camera className="h-6 w-6" /><span className="text-xs">Upload photo</span></div>}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => onChange(r.result as string); r.readAsDataURL(f); }} />
      </div>
    </div>
  );
}

export default function Complaints() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const isMaintenance = user?.role === 'maintenance';

  useEffect(() => {
    if (user && user.role === 'student') navigate('/dashboard/student');
  }, [user, navigate]);

  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [assignedTo, setAssignedTo] = useState('');
  const [newStatus, setNewStatus] = useState<IssueStatus | ''>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [saving, setSaving] = useState(false);

  const staffList = campusUserStore.getStaff().filter(u => u.isActive);

  const refresh = useCallback(() => {
    let issues = issueStore.getAll();
    if (isMaintenance) issues = issues.filter(i => i.assignedTo?.name === user?.name);
    setAllIssues(issues);
  }, [isMaintenance, user]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = allIssues.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.studentName.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = (issue: Issue) => {
    setSelectedIssue(issue);
    setAssignedTo(issue.assignedTo ? `${issue.assignedTo.name}||${issue.assignedTo.role}` : '');
    setNewStatus(issue.status);
    setResolutionNotes(issue.resolutionNotes ?? '');
    setAfterPhoto(issue.afterPhotoBase64 ?? '');
    setDetailOpen(true);
  };

  const handleSave = () => {
    if (!selectedIssue || !user) return;
    setSaving(true);
    const prevStatus = selectedIssue.status;
    const assignedUser = assignedTo ? staffList.find(s => `${s.name}||${s.role}` === assignedTo) : undefined;
    const patch: Partial<Issue> = {
      status: (newStatus as IssueStatus) || selectedIssue.status,
      resolutionNotes: resolutionNotes || undefined,
      afterPhotoBase64: afterPhoto || undefined,
      assignedTo: assignedUser ? { id: assignedUser.id, name: assignedUser.name, role: assignedUser.role } : selectedIssue.assignedTo,
    };
    if (assignedUser && selectedIssue.status === 'Submitted') patch.status = 'Assigned';
    issueStore.update(selectedIssue.id, patch);
    const finalStatus = patch.status!;
    if (finalStatus !== prevStatus) {
      notificationStore.add({
        userId: selectedIssue.studentId,
        type: finalStatus === 'Resolved' ? 'issue_resolved' : 'status_changed',
        title: finalStatus === 'Resolved' ? 'Issue Resolved' : 'Issue Status Updated',
        message: `"${selectedIssue.title}" status changed from ${prevStatus} → ${finalStatus}. Updated by ${user.name} (${user.role}).`,
        link: '/student/issues',
      });
    }
    setTimeout(() => {
      refresh();
      setSaving(false);
      setDetailOpen(false);
    }, 400);
  };

  const statCounts = {
    All: allIssues.length,
    Submitted: allIssues.filter(i => i.status === 'Submitted').length,
    'Under Review': allIssues.filter(i => i.status === 'Under Review').length,
    Assigned: allIssues.filter(i => i.status === 'Assigned').length,
    'In Progress': allIssues.filter(i => i.status === 'In Progress').length,
    Resolved: allIssues.filter(i => i.status === 'Resolved').length,
  };

  const title = isMaintenance ? 'My Assigned Tasks' : 'Complaint Management';
  const subtitle = isMaintenance ? 'Issues assigned to you' : 'View, assign, and resolve campus complaints';

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by title, student, category..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as IssueStatus | 'All')}>
            <SelectTrigger className="w-44">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['All', ...STATUS_ORDER] as const).map(s => (
                <SelectItem key={s} value={s}>{s} {statCounts[s as keyof typeof statCounts] !== undefined ? `(${statCounts[s as keyof typeof statCounts]})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STATUS_ORDER.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`p-2 rounded-lg text-center border transition-all ${statusFilter === s ? 'border-primary bg-primary/10' : 'border-border bg-muted/10 hover:border-primary/30'}`}>
              <div className="text-lg font-bold">{statCounts[s]}</div>
              <div className="text-xs text-muted-foreground leading-tight">{s}</div>
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No complaints found</h3>
              <p className="text-sm text-muted-foreground">{search || statusFilter !== 'All' ? 'Try clearing filters.' : isMaintenance ? 'No tasks assigned to you yet.' : 'No complaints submitted yet.'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((issue, i) => (
              <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card cursor-pointer hover:border-primary/30 transition-all" onClick={() => openDetail(issue)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge className={`text-xs border ${statusColor[issue.status]}`}>{issue.status}</Badge>
                          <Badge className={`text-xs ${priorityColor[issue.priority]}`}>{issue.priority}</Badge>
                          <span className="text-xs text-muted-foreground">{issue.category}</span>
                        </div>
                        <h3 className="font-semibold">{issue.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{issue.studentName}</span>
                          <span>{issue.location}</span>
                          {issue.assignedTo && <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{issue.assignedTo.name}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Sheet */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto glass-card border-l border-border/50 p-0">
            {selectedIssue && (
              <>
                <SheetHeader className="p-6 pb-4 border-b border-border/30">
                  <SheetTitle className="text-lg">{selectedIssue.title}</SheetTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={`border ${statusColor[selectedIssue.status]}`}>{selectedIssue.status}</Badge>
                    <Badge className={priorityColor[selectedIssue.priority]}>{selectedIssue.priority}</Badge>
                    <Badge variant="outline">{selectedIssue.category}</Badge>
                  </div>
                </SheetHeader>
                <div className="p-6 space-y-5">
                  {/* Issue Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{selectedIssue.studentName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{selectedIssue.location}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="font-medium">{selectedIssue.department}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span>{new Date(selectedIssue.createdAt).toLocaleString()}</span></div>
                    {selectedIssue.description && <p className="text-muted-foreground bg-muted/10 p-3 rounded-lg text-xs mt-2">{selectedIssue.description}</p>}
                  </div>

                  {selectedIssue.photoBase64 && (
                    <div>
                      <Label className="text-xs mb-2 block text-muted-foreground">BEFORE PHOTO</Label>
                      <img src={selectedIssue.photoBase64} alt="before" className="w-full max-h-40 rounded-lg object-cover" />
                    </div>
                  )}

                  <Separator />

                  {/* Actions (role-based) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Actions</h3>

                    {(isAdmin || isFaculty) && (
                      <div className="space-y-2">
                        <Label className="text-xs">Assign Staff</Label>
                        <Select value={assignedTo} onValueChange={setAssignedTo}>
                          <SelectTrigger>
                            <SelectValue placeholder="— Unassigned —" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__unassigned__">— Unassigned —</SelectItem>
                            {staffList.map(s => (
                              <SelectItem key={s.id} value={`${s.name}||${s.role}`}>
                                {s.name} <span className="text-muted-foreground text-xs">({s.role})</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs">Status</Label>
                      <Select value={newStatus} onValueChange={v => setNewStatus(v as IssueStatus)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_ORDER.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Resolution Notes</Label>
                      <Textarea placeholder="Describe the resolution or updates..." rows={3} value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} />
                    </div>

                    <ImageUpload label="AFTER PHOTO" value={afterPhoto} onChange={setAfterPhoto} />

                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Save Changes & Notify Student
                    </Button>
                  </div>

                  {/* Timeline */}
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Status Timeline</h3>
                    <div className="space-y-2">
                      {selectedIssue.statusHistory.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span className="font-medium">{h.status}</span>
                          <span className="text-muted-foreground text-xs">{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
