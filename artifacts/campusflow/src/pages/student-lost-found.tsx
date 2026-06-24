import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { lostFoundStore, type LostFoundItem } from "@/lib/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  Tag,
} from "lucide-react";

const statusColor: Record<LostFoundItem["status"], string> = {
  Reported: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Matched: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Claimed: "bg-green-500/20 text-green-400 border-green-500/30",
};

function ImageUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (b: string) => void;
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
    <div
      className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors text-center"
      onClick={() => ref.current?.click()}
    >
      {value ? (
        <img
          src={value}
          alt="upload"
          className="max-h-36 mx-auto rounded object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
          <Camera className="h-7 w-7" />
          <span className="text-sm">Upload Photo (optional)</span>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function ItemCard({
  item,
  isOwn,
  onStatusChange,
}: {
  item: LostFoundItem;
  isOwn?: boolean;
  onStatusChange?: () => void;
}) {
  return (
    <Card className={`glass-card ${isOwn ? "border-primary/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {item.photoBase64 ? (
            <img
              src={item.photoBase64}
              alt={item.itemName}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge
                className={`text-xs ${item.reportType === "lost" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
              >
                {item.reportType === "lost" ? "Lost" : "Found"}
              </Badge>
              <Badge className={`text-xs border ${statusColor[item.status]}`}>
                {item.status}
              </Badge>
              {isOwn && (
                <Badge variant="outline" className="text-xs">
                  Mine
                </Badge>
              )}
            </div>
            <h3 className="font-semibold">{item.itemName}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reported by: {item.studentName}
            </p>
            {isOwn && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Update Status:
                </span>
                <select
                  value={item.status}
                  onChange={(e) => {
                    lostFoundStore.updateStatus(item.id, e.target.value as any);
                    onStatusChange?.();
                  }}
                  className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Reported" className="bg-black">
                    Reported
                  </option>
                  <option value="Matched" className="bg-black">
                    Matched
                  </option>
                  <option value="Claimed" className="bg-black">
                    Claimed
                  </option>
                </select>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type FormView = "browse" | "report" | "success";

export default function StudentLostFound() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [formView, setFormView] = useState<FormView>("browse");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    reportType: "lost" as "lost" | "found",
    itemName: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0] ?? "",
    photoBase64: "",
  });

  const allItems = lostFoundStore.getAll();
  const filtered = allItems.filter((item) => {
    const matchSearch =
      !search ||
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.reportType === filter;
    return matchSearch && matchFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.itemName || !form.location) return;
    setSubmitting(true);
    setTimeout(() => {
      lostFoundStore.create({
        ...form,
        studentId: user.id,
        studentName: user.name,
        photoBase64: form.photoBase64 || undefined,
      });
      addNotification({
        type: "lost_found_match",
        title: `${form.reportType === "lost" ? "Lost" : "Found"} Item Reported`,
        message: `Your report for "${form.itemName}" has been submitted to the Lost & Found board.`,
        link: "/student/lost-found",
      });
      setSubmitting(false);
      setFormView("success");
    }, 600);
  };

  const resetForm = () => {
    setForm({
      reportType: "lost",
      itemName: "",
      description: "",
      location: "",
      date: new Date().toISOString().split("T")[0] ?? "",
      photoBase64: "",
    });
    setFormView("browse");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
            <p className="text-muted-foreground mt-1">
              Browse items or report a lost/found item.
            </p>
          </div>
          {formView === "browse" && (
            <Button onClick={() => setFormView("report")} className="gap-2">
              <Plus className="h-4 w-4" />
              Report Item
            </Button>
          )}
        </div>

        {formView === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-green-500/30">
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <CheckCircle2 className="h-16 w-16 text-green-400" />
                <div>
                  <h2 className="text-xl font-bold text-green-400">
                    Item Reported!
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Your report has been added to the Lost & Found board.
                  </p>
                </div>
                <Button onClick={resetForm}>View All Items</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {formView === "report" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFormView("browse")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">Report an Item</h2>
            </div>
            <Card className="glass-card max-w-xl">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="mb-3 block">Type *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["lost", "found"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, reportType: t }))
                          }
                          className={`p-3 rounded-lg border-2 font-medium capitalize transition-all ${
                            form.reportType === t
                              ? t === "lost"
                                ? "border-red-500 bg-red-500/20 text-red-400"
                                : "border-green-500 bg-green-500/20 text-green-400"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {t === "lost" ? "😔 I Lost" : "🙌 I Found"} Something
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input
                      placeholder="e.g. Black Laptop Bag"
                      value={form.itemName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, itemName: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the item (color, brand, distinguishing features...)"
                      rows={2}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Input
                        placeholder="Where lost/found?"
                        value={form.location}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, location: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, date: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <ImageUpload
                    value={form.photoBase64}
                    onChange={(b) => setForm((f) => ({ ...f, photoBase64: b }))}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormView("browse")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Submit Report
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {formView === "browse" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {(["all", "lost", "found"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">No items found</h3>
                  <p className="text-sm text-muted-foreground">
                    {search
                      ? "Try different search terms."
                      : "No items have been reported yet. Be the first!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ItemCard
                      item={item}
                      isOwn={item.studentId === user?.id}
                      onStatusChange={() => setRefreshKey((k) => k + 1)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
