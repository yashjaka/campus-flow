import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { issueStore, sosStore, notificationStore } from "@/lib/student-store";
import { bookingStore, eventStore, surveyStore } from "@/lib/campus-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Star,
  Users,
  MessageSquareWarning,
} from "lucide-react";

const CHART_COLORS = [
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];
const STATUS_COLORS: Record<string, string> = {
  Submitted: "#3b82f6",
  "Under Review": "#f59e0b",
  Assigned: "#8b5cf6",
  "In Progress": "#f97316",
  Resolved: "#22c55e",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    color?: string;
    fill?: string;
    name: string;
    value: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#12122a] p-3 text-xs shadow-xl">
      {label && <p className="mb-2 font-semibold text-white/80">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill ?? "#fff" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  delay = 0,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Analytics() {
  const allIssues = issueStore.getAll();
  const resolved = allIssues.filter((i) => i.status === "Resolved");
  const pending = allIssues.filter((i) => i.status !== "Resolved");
  const resolutionRate =
    allIssues.length > 0
      ? Math.round((resolved.length / allIssues.length) * 100)
      : 0;
  const rated = resolved.filter((i) => i.rating?.stars);
  const avgRating =
    rated.length > 0
      ? rated.reduce((s, i) => s + (i.rating?.stars ?? 0), 0) / rated.length
      : 0;

  const allSos = sosStore.getAll();
  const allBookings = bookingStore.getAll();
  const allEvents = eventStore.getAll();
  const totalRegistrations = allEvents.reduce(
    (s, e) => s + e.attendees.length,
    0,
  );
  const allSurveys = surveyStore.getAll();
  const totalSurveyResponses = allSurveys.reduce(
    (s, sv) => s + sv.responses.length,
    0,
  );
  const allNotifs = notificationStore.getAll();

  // Monthly trend (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    return {
      month: label,
      Complaints: allIssues.filter((iss) => iss.createdAt.startsWith(key))
        .length,
      Resolved: allIssues.filter(
        (iss) => iss.createdAt.startsWith(key) && iss.status === "Resolved",
      ).length,
    };
  });

  // Category breakdown
  const catMap: Record<string, number> = {};
  allIssues.forEach((i) => {
    catMap[i.category] = (catMap[i.category] ?? 0) + 1;
  });
  const categoryData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Status distribution
  const statMap: Record<string, number> = {
    Submitted: 0,
    "Under Review": 0,
    Assigned: 0,
    "In Progress": 0,
    Resolved: 0,
  };
  allIssues.forEach((i) => {
    statMap[i.status]++;
  });
  const statusData = Object.entries(statMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Resource usage
  const resMap: Record<string, number> = {};
  allBookings.forEach((b) => {
    resMap[b.resource] = (resMap[b.resource] ?? 0) + 1;
  });
  const resourceData = Object.entries(resMap).map(([name, bookings]) => ({
    name: name.replace(" (Portable)", ""),
    bookings,
  }));

  // Staff performance
  const staffMap: Record<
    string,
    { name: string; total: number; resolved: number; ratings: number[] }
  > = {};
  allIssues.forEach((i) => {
    if (!i.assignedTo) return;
    const k = i.assignedTo.name;
    if (!staffMap[k])
      staffMap[k] = { name: k, total: 0, resolved: 0, ratings: [] };
    staffMap[k].total++;
    if (i.status === "Resolved") {
      staffMap[k].resolved++;
      if (i.rating?.stars) staffMap[k].ratings.push(i.rating.stars);
    }
  });
  const staffData = Object.values(staffMap)
    .map((s) => ({
      ...s,
      avgRating:
        s.ratings.length > 0
          ? (s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length).toFixed(1)
          : "—",
      rate: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0,
    }))
    .sort((a, b) => b.resolved - a.resolved);

  // Department breakdown
  const deptMap: Record<string, number> = {};
  allIssues.forEach((i) => {
    deptMap[i.department] = (deptMap[i.department] ?? 0) + 1;
  });
  const deptData = Object.entries(deptMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Best department (lowest open / highest resolution)
  const deptResMap: Record<string, { total: number; resolved: number }> = {};
  allIssues.forEach((i) => {
    if (!deptResMap[i.department])
      deptResMap[i.department] = { total: 0, resolved: 0 };
    deptResMap[i.department].total++;
    if (i.status === "Resolved") deptResMap[i.department].resolved++;
  });
  const bestDept = Object.entries(deptResMap)
    .filter(([, v]) => v.total >= 2)
    .sort(([, a], [, b]) => b.resolved / b.total - a.resolved / a.total)[0];

  const recentActivity = allNotifs.slice(0, 15);
  const notifEmoji: Record<string, string> = {
    issue_resolved: "✅",
    status_changed: "🔄",
    booking_approved: "📅",
    booking_rejected: "❌",
    new_event: "🎉",
    new_notice: "📋",
    sos_update: "🆘",
    lost_found_match: "🔍",
    issue_assigned: "👤",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            SAL Institute — Real-time campus operations intelligence.
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resolution">Resolution</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-5 mt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiCard
                title="Total Complaints"
                value={allIssues.length}
                sub="All time"
                icon={MessageSquareWarning}
                color="text-purple-400"
                delay={0.05}
              />
              <KpiCard
                title="Resolved"
                value={resolved.length}
                sub={`${resolutionRate}% rate`}
                icon={CheckCircle2}
                color="text-green-400"
                delay={0.1}
              />
              <KpiCard
                title="Pending"
                value={pending.length}
                sub="Open complaints"
                icon={Clock}
                color="text-yellow-400"
                delay={0.15}
              />
              <KpiCard
                title="Resolution Rate"
                value={`${resolutionRate}%`}
                sub={`${resolved.length} of ${allIssues.length}`}
                icon={BarChart2}
                color="text-blue-400"
                delay={0.2}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiCard
                title="Avg Rating"
                value={avgRating > 0 ? `${avgRating.toFixed(1)}/5` : "N/A"}
                sub={`${rated.length} ratings received`}
                icon={Star}
                color="text-yellow-400"
                delay={0.25}
              />
              <KpiCard
                title="SOS Alerts"
                value={allSos.length}
                sub={`${allSos.filter((s) => s.status === "Resolved").length} resolved`}
                icon={AlertCircle}
                color="text-red-400"
                delay={0.3}
              />
              <KpiCard
                title="Event Registrations"
                value={totalRegistrations}
                sub={`${allEvents.length} events`}
                icon={BookOpen}
                color="text-pink-400"
                delay={0.35}
              />
              <KpiCard
                title="Survey Responses"
                value={totalSurveyResponses}
                sub={`${allSurveys.length} surveys`}
                icon={FileText}
                color="text-cyan-400"
                delay={0.4}
              />
            </div>

            {/* Trend + Status Donut */}
            <div className="grid gap-4 lg:grid-cols-3">
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Complaint Trend — Last 6 Months
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={210}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient
                            id="gTotal"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gResolved"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#22c55e"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22c55e"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="Complaints"
                          stroke="#8b5cf6"
                          fill="url(#gTotal)"
                          strokeWidth={2}
                          dot={{ fill: "#8b5cf6", r: 3 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Resolved"
                          stroke="#22c55e"
                          fill="url(#gResolved)"
                          strokeWidth={2}
                          dot={{ fill: "#22c55e", r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-purple-400 inline-block" />
                        Complaints
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-green-400 inline-block" />
                        Resolved
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusData.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-10">
                        No data
                      </p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={160}>
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {statusData.map((entry) => (
                                <Cell
                                  key={entry.name}
                                  fill={STATUS_COLORS[entry.name] ?? "#6b7280"}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-1">
                          {statusData.map((s) => (
                            <div
                              key={s.name}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ background: STATUS_COLORS[s.name] }}
                                />
                                {s.name}
                              </span>
                              <span className="font-semibold">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Category + Resource */}
            <div className="grid gap-4 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Complaints by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryData.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No data
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={categoryData} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: "#9ca3af", fontSize: 11 }}
                            width={90}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar
                            dataKey="value"
                            name="Complaints"
                            radius={[0, 4, 4, 0]}
                          >
                            {categoryData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={CHART_COLORS[i % CHART_COLORS.length]!}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Resource Booking Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resourceData.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No bookings yet
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={resourceData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#6b7280", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            angle={-15}
                            textAnchor="end"
                            height={45}
                          />
                          <YAxis
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar
                            dataKey="bookings"
                            name="Bookings"
                            radius={[4, 4, 0, 0]}
                          >
                            {resourceData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={CHART_COLORS[i % CHART_COLORS.length]!}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── RESOLUTION ANALYTICS ─────────────────────────────────────── */}
          <TabsContent value="resolution" className="space-y-5 mt-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Star,
                  color: "text-yellow-400",
                  value: avgRating > 0 ? avgRating.toFixed(1) : "—",
                  label: "Avg Resolution Rating",
                  sub: `from ${rated.length} rated complaints`,
                },
                {
                  icon: CheckCircle2,
                  color: "text-green-400",
                  value: `${resolutionRate}%`,
                  label: "Resolution Rate",
                  sub: `${resolved.length} of ${allIssues.length} resolved`,
                },
                {
                  icon: Users,
                  color: "text-blue-400",
                  value: staffData.length,
                  label: "Active Staff",
                  sub: bestDept
                    ? `Best: ${bestDept[0]}`
                    : "Handling complaints",
                },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="glass-card text-center p-6">
                    <c.icon className={`h-8 w-8 ${c.color} mx-auto mb-2`} />
                    <div className={`text-4xl font-bold ${c.color}`}>
                      {c.value}
                    </div>
                    <p className="text-sm font-medium mt-1">{c.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.sub}
                    </p>
                    {c.icon === Star && avgRating > 0 && (
                      <div className="flex justify-center gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${Math.round(avgRating) >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Best Performing Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {staffData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No assigned complaints yet. Assign complaints from the
                      Complaint Management page.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {staffData.map((s, i) => (
                        <motion.div
                          key={s.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.08 }}
                        >
                          <div className="flex items-center gap-4 p-3 bg-muted/10 rounded-lg hover:bg-muted/15 transition-colors">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-slate-400/20 text-slate-400" : "bg-orange-500/20 text-orange-400"}`}
                            >
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{s.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-muted/20 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
                                    style={{ width: `${s.rate}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {s.rate}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold">
                                {s.resolved}/{s.total} resolved
                              </p>
                              <p className="text-xs text-yellow-400">
                                ★ {s.avgRating}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Complaints by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deptData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No data yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={deptData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#6b7280", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          angle={-15}
                          textAnchor="end"
                          height={45}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="value"
                          name="Complaints"
                          radius={[4, 4, 0, 0]}
                        >
                          {deptData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]!}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── ACTIVITY FEED ─────────────────────────────────────────────── */}
          <TabsContent value="activity" className="mt-5">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">
                  Recent Campus Activity
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {allNotifs.length} total events recorded
                </p>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No activity yet. Start using the platform to see events
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentActivity.map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                          <span className="text-xl flex-shrink-0 mt-0.5">
                            {notifEmoji[n.type] ?? "📌"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {n.message}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
