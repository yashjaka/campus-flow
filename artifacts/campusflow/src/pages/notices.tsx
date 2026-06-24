import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  noticeStore,
  NOTICE_CATEGORIES,
  type Notice,
} from "@/lib/campus-store";
import { notificationStore } from "@/lib/student-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

const catColor: Record<string, string> = {
  Academic: "bg-blue-500/20 text-blue-400",
  Examination: "bg-red-500/20 text-red-400",
  Placement: "bg-green-500/20 text-green-400",
  Circular: "bg-yellow-500/20 text-yellow-400",
  Announcement: "bg-purple-500/20 text-purple-400",
};

const emptyForm = {
  title: "",
  content: "",
  category: NOTICE_CATEGORIES[0] as string,
};

export default function Notices() {
  const { user } = useAuth();
  const isStaff = user?.role === "faculty" || user?.role === "admin";
  const [notices, setNotices] = useState<Notice[]>(() => noticeStore.getAll());
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(() => setNotices(noticeStore.getAll()), []);

  const filtered = notices.filter((n) => {
    const matchSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      catFilter === "All"
        ? true
        : catFilter === "Bookmarked"
          ? n.bookmarkedBy.includes(user?.id ?? "")
          : n.category === catFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (n: Notice) => {
    setEditing(n.id);
    setForm({ title: n.title, content: n.content, category: n.category });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!user || !form.title || !form.content) return;
    setSaving(true);
    setTimeout(() => {
      if (editing) {
        noticeStore.update(editing, form);
      } else {
        noticeStore.create({
          ...form,
          publishedBy: user.name,
          publishedByRole: user.role,
        });
        notificationStore.add({
          userId: "broadcast",
          type: "new_notice",
          title: `New Notice: ${form.title}`,
          message: `Category: ${form.category}. Published by ${user.name}.`,
          link: "/notices",
        });
      }
      refresh();
      setSaving(false);
      setDialogOpen(false);
    }, 400);
  };

  const toggleBookmark = (id: string) => {
    if (!user) return;
    noticeStore.toggleBookmark(id, user.id);
    refresh();
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
            <p className="text-muted-foreground mt-1">
              Official campus announcements and circulars.
            </p>
          </div>
          {isStaff && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Publish Notice
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notices..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              "All",
              ...NOTICE_CATEGORIES,
              ...(user?.role === "student" ? ["Bookmarked"] : []),
            ].map((c) => (
              <Button
                key={c}
                variant={catFilter === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCatFilter(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="glass-card text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  {isStaff
                    ? "No notices yet. Publish the first one!"
                    : "No notices found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((n, i) => {
              const isBookmarked = user
                ? n.bookmarkedBy.includes(user.id)
                : false;
              const isExpanded = expanded === n.id;
              const isOwn = n.publishedBy === user?.name;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="glass-card hover:border-primary/20 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge
                              className={`text-xs ${catColor[n.category] ?? "bg-muted/20 text-muted-foreground"}`}
                            >
                              {n.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              By {n.publishedBy}
                            </span>
                          </div>
                          <h3 className="font-semibold text-base mb-2">
                            {n.title}
                          </h3>
                          <p
                            className={`text-sm text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}
                          >
                            {n.content}
                          </p>
                          <button
                            onClick={() =>
                              setExpanded(isExpanded ? null : n.id)
                            }
                            className="text-xs text-primary mt-1 hover:underline"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {user?.role === "student" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
                              onClick={() => toggleBookmark(n.id)}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="h-4 w-4" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {isStaff && isOwn && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(n)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  noticeStore.delete(n.id);
                                  refresh();
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Notice" : "Publish New Notice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Notice title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                placeholder="Write the notice content..."
                rows={5}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editing ? "Save" : "Publish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
