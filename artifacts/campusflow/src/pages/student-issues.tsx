import { useState, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { issueStore, categorizeIssue, type Issue, type IssuePriority, type IssueStatus } from "@/lib/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  Loader2,
  Plus,
  Star,
  Wrench,
} from "lucide-react";

type View = 'list' | 'new' | 'detail';

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

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 ${(hovered || value) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        </button>
      ))}
    </div>
  );
}

function StatusTimeline({ history, currentStatus }: { history: Issue['statusHistory']; currentStatus: IssueStatus }) {
  return (
    <div className="space-y-3">
      {STATUS_ORDER.map((status, i) => {
        const entry = history.find((h) => h.status === status);
        const currentIdx = STATUS_ORDER.indexOf(currentStatus);
        const isDone = i < currentIdx || status === currentStatus;
        const isCurrent = status === currentStatus;

        return (
          <div key={status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  isDone
                    ? isCurrent
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-muted/20 border-border text-muted-foreground'
                }`}
              >
                {isDone && !isCurrent ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={`w-0.5 h-6 mt-1 ${isDone ? 'bg-primary/40' : 'bg-border'}`} />
              )}
            </div>
            <div className="pb-2 flex-1">
              <p className={`text-sm font-medium ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>{status}</p>
              {entry && (
                <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Label className="text-sm mb-2 block">{label}</Label>
      <div
        className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors text-center"
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <img src={value} alt="upload preview" className="max-h-40 mx-auto rounded object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Camera className="h-8 w-8" />
            <span className="text-sm">Click to upload photo</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function StudentIssues() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>(() =>
    user ? issueStore.getByStudent(user.id) : [],
  );
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const refresh = useCallback(() => {
    if (user) setIssues(issueStore.getByStudent(user.id));
  }, [user]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    priority: '' as IssuePriority | '',
    department: '',
    photoBase64: '',
  });
  const [suggestion, setSuggestion] = useState<{ category: string; priority: IssuePriority; department: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAISuggest = () => {
    if (!form.title && !form.description) return;
    const s = categorizeIssue(form.title, form.description);
    setSuggestion(s);
    setForm((f) => ({ ...f, category: s.category, priority: s.priority, department: s.department }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title || !form.location) return;
    setSubmitting(true);
    setTimeout(() => {
      const issue = issueStore.create({
        studentId: user.id,
        studentName: user.name,
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category || 'General',
        priority: (form.priority as IssuePriority) || 'Low',
        department: form.department || 'Administration',
        photoBase64: form.photoBase64 || undefined,
      });
      addNotification({
        type: 'status_changed',
        title: 'Issue Submitted',
        message: `Your issue "${issue.title}" has been submitted successfully.`,
        link: '/student/issues',
      });
      refresh();
      setSubmitting(false);
      setView('list');
      setForm({ title: '', description: '', location: '', category: '', priority: '', department: '', photoBase64: '' });
      setSuggestion(null);
    }, 600);
  };

  const selectedIssue = selectedId ? issueStore.getById(selectedId) : null;

  const handleRate = () => {
    if (!selectedId || !ratingStars) return;
    issueStore.addRating(selectedId, ratingStars, ratingComment);
    addNotification({
      type: 'issue_resolved',
      title: 'Rating Submitted',
      message: `You rated the resolution ${ratingStars} star${ratingStars > 1 ? 's' : ''}.`,
    });
    setRatingSubmitted(true);
    refresh();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">My Issues</h1>
                  <p className="text-muted-foreground mt-1">Track and manage your reported issues.</p>
                </div>
                <Button onClick={() => setView('new')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Report Issue
                </Button>
              </div>

              {issues.length === 0 ? (
                <Card className="glass-card text-center py-16">
                  <CardContent>
                    <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No issues yet</h3>
                    <p className="text-muted-foreground mb-4">Report campus issues and track their resolution.</p>
                    <Button onClick={() => setView('new')}>Report Your First Issue</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue, i) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className="glass-card cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => {
                          setSelectedId(issue.id);
                          setRatingStars(issue.rating?.stars ?? 0);
                          setRatingComment(issue.rating?.comment ?? '');
                          setRatingSubmitted(!!issue.rating);
                          setView('detail');
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge className={`text-xs border ${statusColor[issue.status]}`}>{issue.status}</Badge>
                                <Badge className={`text-xs ${priorityColor[issue.priority]}`}>{issue.priority}</Badge>
                                <span className="text-xs text-muted-foreground">{issue.category}</span>
                              </div>
                              <h3 className="font-semibold truncate">{issue.title}</h3>
                              <p className="text-sm text-muted-foreground">{issue.location}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">{new Date(issue.createdAt).toLocaleDateString()}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'new' && (
            <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => setView('list')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Report Issue</h1>
                  <p className="text-muted-foreground mt-1">Submit a new campus issue for resolution.</p>
                </div>
              </div>

              <div className="max-w-2xl">
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label>Issue Title *</Label>
                        <Input
                          placeholder="e.g. Water leaking from ceiling in Room 204"
                          value={form.title}
                          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                          required
                          onBlur={handleAISuggest}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe the issue in detail..."
                          rows={3}
                          value={form.description}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                          onBlur={handleAISuggest}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Location *</Label>
                        <Input
                          placeholder="e.g. Block A, Room 204, 2nd Floor"
                          value={form.location}
                          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                          required
                        />
                      </div>

                      {suggestion && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-primary/10 border border-primary/20 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">AI Suggestion Applied</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Category: <strong className="text-foreground">{suggestion.category}</strong></span>
                            <span>Priority: <strong className="text-foreground">{suggestion.priority}</strong></span>
                            <span>Dept: <strong className="text-foreground">{suggestion.department}</strong></span>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input
                            placeholder="e.g. Plumbing"
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={form.priority}
                            onValueChange={(v) => setForm((f) => ({ ...f, priority: v as IssuePriority }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {(['Low', 'Medium', 'High', 'Critical'] as IssuePriority[]).map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input
                          placeholder="e.g. Maintenance"
                          value={form.department}
                          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                        />
                      </div>

                      <ImageUpload
                        label="Upload Photo (Before)"
                        value={form.photoBase64}
                        onChange={(base64) => setForm((f) => ({ ...f, photoBase64: base64 }))}
                      />

                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setView('list')} className="flex-1">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="flex-1">
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Submit Issue
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {view === 'detail' && selectedIssue && (
            <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => setView('list')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{selectedIssue.title}</h1>
                  <p className="text-muted-foreground text-sm">{selectedIssue.location}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-base">Issue Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`border ${statusColor[selectedIssue.status]}`}>{selectedIssue.status}</Badge>
                        <Badge className={priorityColor[selectedIssue.priority]}>{selectedIssue.priority} Priority</Badge>
                        <Badge variant="outline">{selectedIssue.category}</Badge>
                        <Badge variant="outline">{selectedIssue.department}</Badge>
                      </div>
                      {selectedIssue.description && (
                        <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Submitted {new Date(selectedIssue.createdAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  {(selectedIssue.photoBase64 || selectedIssue.afterPhotoBase64) && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-base">Photos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedIssue.photoBase64 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 font-medium">BEFORE</p>
                              <img
                                src={selectedIssue.photoBase64}
                                alt="Before"
                                className="rounded-lg w-full object-cover max-h-48"
                              />
                            </div>
                          )}
                          {selectedIssue.afterPhotoBase64 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 font-medium">AFTER</p>
                              <img
                                src={selectedIssue.afterPhotoBase64}
                                alt="After"
                                className="rounded-lg w-full object-cover max-h-48"
                              />
                            </div>
                          )}
                        </div>
                        {selectedIssue.resolutionNotes && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-xs font-medium text-green-400 mb-1">Resolution Notes</p>
                            <p className="text-sm">{selectedIssue.resolutionNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {selectedIssue.status === 'Resolved' && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-base">Rate Resolution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {ratingSubmitted ? (
                          <div className="flex items-center gap-3 text-green-400">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>Thanks for your feedback! You rated {ratingStars} star{ratingStars > 1 ? 's' : ''}.</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <StarRating value={ratingStars} onChange={setRatingStars} />
                            <Textarea
                              placeholder="Optional comment about the resolution..."
                              rows={2}
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                            />
                            <Button onClick={handleRate} disabled={!ratingStars}>
                              Submit Rating
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-base">Status Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StatusTimeline history={selectedIssue.statusHistory} currentStatus={selectedIssue.status} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
