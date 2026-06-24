import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  campusUserStore,
  type CampusUser,
  type UserRole,
} from "@/lib/campus-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Search, Users } from "lucide-react";

const roleBadge: Record<UserRole, string> = {
  admin: "bg-purple-500/20 text-purple-400",
  faculty: "bg-blue-500/20 text-blue-400",
  maintenance: "bg-orange-500/20 text-orange-400",
  student: "bg-green-500/20 text-green-400",
};
const roleIcon: Record<UserRole, string> = {
  admin: "🛡️",
  faculty: "🎓",
  maintenance: "🔧",
  student: "📚",
};

type View = "list" | "add";

export default function AdminUserMgmt() {
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [users, setUsers] = useState<CampusUser[]>(() =>
    campusUserStore.getAll(),
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student" as UserRole,
    department: "",
    enrollmentNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => setUsers(campusUserStore.getAll()), []);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    faculty: users.filter((u) => u.role === "faculty").length,
    maintenance: users.filter((u) => u.role === "maintenance").length,
    student: users.filter((u) => u.role === "student").length,
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      campusUserStore.create({
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department || undefined,
        enrollmentNumber: form.enrollmentNumber || undefined,
        isActive: true,
      });
      refresh();
      setForm({
        name: "",
        email: "",
        role: "student",
        department: "",
        enrollmentNumber: "",
      });
      setSubmitting(false);
      setView("list");
    }, 400);
  };

  const toggleActive = (id: string) => {
    campusUserStore.toggleActive(id);
    refresh();
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    User Management
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage campus users, roles, and access.
                  </p>
                </div>
                <Button onClick={() => setView("add")} className="gap-2">
                  <Plus className="h-4 w-4" /> Add User
                </Button>
              </div>

              {/* Role filter tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(
                  ["all", "admin", "faculty", "maintenance", "student"] as const
                ).map((r) => (
                  <Button
                    key={r}
                    variant={roleFilter === r ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter(r)}
                    className="capitalize gap-1"
                  >
                    {r !== "all" && <span>{roleIcon[r]}</span>}
                    {r} ({counts[r]})
                  </Button>
                ))}
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, department..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {filtered.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className={`glass-card ${!u.isActive ? "opacity-60" : ""}`}
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${roleBadge[u.role]}`}
                          >
                            {roleIcon[u.role]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{u.name}</h3>
                              <Badge className={`text-xs ${roleBadge[u.role]}`}>
                                {u.role}
                              </Badge>
                              {!u.isActive && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-muted-foreground"
                                >
                                  Disabled
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {u.email}
                            </p>
                            {u.department && (
                              <p className="text-xs text-muted-foreground">
                                {u.department}
                              </p>
                            )}
                            {u.enrollmentNumber && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {u.enrollmentNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {u.isActive ? "Active" : "Disabled"}
                          </span>
                          <Switch
                            checked={u.isActive}
                            onCheckedChange={() => toggleActive(u.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <Card className="glass-card text-center py-10">
                    <CardContent>
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No users found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {view === "add" && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView("list")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Add User
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Create a new campus user account.
                  </p>
                </div>
              </div>
              <Card className="glass-card max-w-lg">
                <CardContent className="p-6">
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="e.g. Dr. Anita Desai"
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="user@campusflow.demo"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role *</Label>
                      <Select
                        value={form.role}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, role: v as UserRole }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            [
                              "student",
                              "faculty",
                              "maintenance",
                              "admin",
                            ] as UserRole[]
                          ).map((r) => (
                            <SelectItem
                              key={r}
                              value={r}
                              className="capitalize"
                            >
                              {roleIcon[r]} {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        placeholder="e.g. Computer Science"
                        value={form.department}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, department: e.target.value }))
                        }
                      />
                    </div>
                    {form.role === "student" && (
                      <div className="space-y-2">
                        <Label>Enrollment Number</Label>
                        <Input
                          placeholder="ENR2024006"
                          value={form.enrollmentNumber}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              enrollmentNumber: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setView("list")}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1"
                      >
                        {submitting ? "Adding..." : "Add User"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
