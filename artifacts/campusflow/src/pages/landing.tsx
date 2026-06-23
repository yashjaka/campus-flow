import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useStudentEntry, useStaffLogin, useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { campusUserStore } from "@/lib/campus-store";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GraduationCap, Users, Shield, Wrench, AlertTriangle, Package, Search,
  Calendar, MapPin, Sparkles, Megaphone, Bookmark, MessageSquare, Star,
  BarChart3, Heart, CheckCircle2, ChevronRight, ArrowRight, Loader2, Mail, Lock
} from "lucide-react";

// --- Validations ---
const studentSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  enrollmentNumber: z.string().min(3, "Enrollment number is required"),
  collegeName: z.string().min(2, "College name is required"),
  department: z.string().min(2, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
});

const staffSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["faculty", "maintenance", "admin"]),
});

// --- Simple CountUp Component ---
function CountUp({ end, suffix = "", delay = 0.1 }: { end: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    let timer: number;
    
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const run = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          timer = requestAnimationFrame(run);
        }
      };
      timer = requestAnimationFrame(run);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(timer);
    };
  }, [end, delay]);

  return <span>{count}{suffix}</span>;
}

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Dialog State
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  // Tab State for Previews
  const [previewTab, setPreviewTab] = useState<"student" | "faculty" | "admin">("student");

  // API Hooks
  const studentEntry = useStudentEntry();
  const staffLogin = useStaffLogin();
  const adminLogin = useAdminLogin();

  // Forms
  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", enrollmentNumber: "", collegeName: "", department: "", semester: "" },
  });

  const staffForm = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: { email: "", password: "", role: "faculty" },
  });

  // Automatically direct logged-in users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, setLocation]);

  // Submit Student
  const onStudentSubmit = (values: z.infer<typeof studentSchema>) => {
    studentEntry.mutate(
      { data: { enrollmentNumber: values.enrollmentNumber } },
      {
        onSuccess: (response) => {
          login(response.token, response.user);
          toast({ title: "Welcome back", description: `Successfully logged in as ${response.user.name}` });
          setStudentModalOpen(false);
          setLocation("/dashboard/student");
        },
        onError: (err: any) => {
          // Auto-registration fallback for sandbox/local testing
          if (err.status === 404 || err.message?.includes("not found")) {
            toast({ title: "Creating sandbox student", description: "Enrollment not found. Registering a new student profile in local storage." });
            const localUser = campusUserStore.create({
              name: values.name,
              email: `${values.enrollmentNumber.toLowerCase()}@campusflow.demo`,
              role: "student",
              enrollmentNumber: values.enrollmentNumber,
              collegeName: values.collegeName,
              department: values.department,
              semester: Number(values.semester),
              isActive: true,
            });

            login(`mock-token-${values.enrollmentNumber}`, {
              id: localUser.id,
              name: localUser.name,
              role: "student",
              email: localUser.email || null,
              enrollmentNumber: localUser.enrollmentNumber || null,
              collegeName: localUser.collegeName || null,
              department: localUser.department || null,
              semester: localUser.semester || null,
              createdAt: localUser.createdAt,
            });

            toast({ title: "Registration complete", description: `Logged in as student ${localUser.name}` });
            setStudentModalOpen(false);
            setLocation("/dashboard/student");
          } else {
            toast({ title: "Login failed", description: err.message || "Something went wrong.", variant: "destructive" });
          }
        },
      }
    );
  };

  // Submit Staff / Admin
  const onStaffSubmit = (values: z.infer<typeof staffSchema>) => {
    const handleSuccess = (response: any, typeName: string) => {
      login(response.token, response.user);
      toast({ title: "Welcome back", description: `Logged in as ${typeName}` });
      setStaffModalOpen(false);
      setLocation(`/dashboard/${response.user.role}`);
    };

    const handleError = (err: any) => {
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    };

    if (values.role === "admin") {
      adminLogin.mutate(
        { data: { email: values.email, password: values.password } },
        {
          onSuccess: (res) => handleSuccess(res, "Campus Administrator"),
          onError: handleError,
        }
      );
    } else {
      staffLogin.mutate(
        { data: { email: values.email, password: values.password } },
        {
          onSuccess: (res) => handleSuccess(res, values.role === "faculty" ? "Faculty Member" : "Facilities Crew"),
          onError: handleError,
        }
      );
    }
  };

  // Helper function to fill demo credentials
  const fillDemo = (email: string, pass: string, role: "faculty" | "maintenance" | "admin") => {
    staffForm.setValue("email", email);
    staffForm.setValue("password", pass);
    staffForm.setValue("role", role);
  };

  const fillStudentDemo = () => {
    studentForm.setValue("name", "Priya Sharma");
    studentForm.setValue("enrollmentNumber", "ENR2024001");
    studentForm.setValue("collegeName", "State University of Technology");
    studentForm.setValue("department", "Computer Science");
    studentForm.setValue("semester", "4");
  };

  // Features list
  const features = [
    { icon: Wrench, title: "Smart Issue Reporting", desc: "Report maintenance or plumbing requests. Categorized and dispatched instantly.", color: "text-purple-400" },
    { icon: AlertTriangle, title: "Emergency SOS Reporting", desc: "Panic medical, fire, or security buttons broadcasting location coordinates to security.", color: "text-red-400" },
    { icon: Search, title: "Lost & Found Board", desc: "Browse items, search locations, and post lost property notifications with photos.", color: "text-blue-400" },
    { icon: Calendar, title: "Resource Booking", desc: "Reserve computer labs, auditorium, and audio equipment with automated conflict checking.", color: "text-emerald-400" },
    { icon: Sparkles, title: "Event Hub", desc: "Explore campus workshops, hackathons, and guest lectures. RSVP and save to calendar.", color: "text-yellow-400" },
    { icon: Megaphone, title: "Digital Notice Board", desc: "Read verified academic notifications, placement updates, and exam circulars.", color: "text-cyan-400" },
    { icon: MessageSquare, title: "Student Feedback", desc: "Engage in class reviews, surveys, and campus feedback assessments.", color: "text-orange-400" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Detailed statistics on issue resolution times, response rates, and resource utilization.", color: "text-pink-400" },
  ];

  // Testimonials
  const testimonials = [
    { quote: "The emergency SOS panic button was critical when a classmate fainted. Campus response teams arrived within 3 minutes.", author: "Arjun Verma", role: "Undergrad Student" },
    { quote: "Booking lab resources used to require physical forms and days of approvals. Now I schedule project space in 15 seconds.", author: "Ananya Bose", role: "B.Tech Final Year" },
    { quote: "It helps my maintenance team track water leaks and socket faults at a glance. Communication is streamlined and rapid.", author: "Carlos Rivera", role: "Facilities Crew Supervisor" },
    { quote: "Publishing exam schedules and class changes has never been easier. I can reach the entire student registry in seconds.", author: "Dr. Sarah Mitchell", role: "Computer Science Faculty" },
  ];

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen text-foreground select-none relative z-10">
        
        {/* --- NAVBAR --- */}
        <header className="glass-nav sticky top-0 px-6 py-4 flex justify-between items-center z-50 transition-all border-b border-white/5">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-9 h-9 rounded bg-primary/20 flex items-center justify-center glow-primary">
              <GraduationCap className="h-5.5 w-5.5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">CampusFlow</span>
          </div>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Home</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#previews" className="hover:text-foreground transition-colors">Dashboard Previews</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>

          <div className="flex gap-3">
            <Button variant="ghost" className="text-sm font-semibold border border-white/10" onClick={() => setStaffModalOpen(true)}>
              Staff/Admin Login
            </Button>
            <Button className="bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold glow-primary" onClick={() => setStudentModalOpen(true)}>
              Enter as Student
            </Button>
          </div>
        </header>

        {/* --- HERO AREA --- */}
        <section id="hero" className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center max-w-5xl mx-auto relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1.5 text-xs font-semibold bg-primary/10 text-primary mb-6 glow-primary">
              ⚡ Now Live: V2 Institutional Hub
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-6">
              Where campus life <br />
              <span className="gradient-text">flows smoothly.</span>
            </h1>
            <p className="text-md sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              An elegant, all-in-one operating platform for universities. Seamlessly connect students, faculty, and administration to report issues, book facilities, and manage campus alerts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-6 rounded-xl text-md glow-primary group" onClick={() => setStudentModalOpen(true)}>
                Get Student Access
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold border border-white/10 px-8 py-6 rounded-xl text-md" onClick={() => setStaffModalOpen(true)}>
                Staff & Admin Portal
              </Button>
            </div>
          </motion.div>
        </section>

        {/* --- STATISTICS SECTION --- */}
        <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm relative z-20">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <h3 className="text-4xl font-extrabold text-purple-400">
                <CountUp end={500} suffix="+" />
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Issues Resolved</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-extrabold text-blue-400">
                <CountUp end={2000} suffix="+" delay={0.2} />
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Students Active</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-extrabold text-emerald-400">
                <CountUp end={150} suffix="+" delay={0.4} />
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Events Managed</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-extrabold text-yellow-400">
                <CountUp end={95} suffix="%" delay={0.6} />
              </h3>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">User Satisfaction</p>
            </div>
          </div>
        </section>

        {/* --- FEATURES SHOWCASE --- */}
        <section id="features" className="py-24 max-w-6xl mx-auto px-6 relative z-20">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              One platform. <span className="gradient-text">Complete integration.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-md">
              Ditch papers and emails. CampusFlow unifies every operational request, announcement, and event under one modern interface.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.025, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-card h-full border-white/5 hover:border-white/10 hover:shadow-lg transition-shadow overflow-hidden group">
                  <CardHeader className="pb-2">
                    <div className={`w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                      <item.icon className={`h-5.5 w-5.5 ${item.color}`} />
                    </div>
                    <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- DASHBOARD PREVIEWS --- */}
        <section id="previews" className="py-20 bg-black/10 border-t border-white/5 relative z-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Designed for every <span className="gradient-text">role.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-md">
                Experience role-tailored dashboards built with beautiful widgets, analytics tables, and dark mode aesthetics.
              </p>
            </div>

            {/* Selector Tabs */}
            <div className="flex justify-center gap-3 mb-10">
              {(["student", "faculty", "admin"] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={previewTab === tab ? "default" : "outline"}
                  onClick={() => setPreviewTab(tab)}
                  className="capitalize font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg border-white/10"
                >
                  {tab === "student" ? "📚 Student" : tab === "faculty" ? "🎓 Faculty" : "🛡️ Admin"}
                </Button>
              ))}
            </div>

            {/* Dashboard Showcase Mockup */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-3 left-4 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="border-b border-white/5 pb-3 mb-5 mt-2 flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-semibold tracking-wider uppercase text-[10px]">CampusFlow Client OS</span>
                <span className="bg-white/5 px-2.5 py-1 rounded">dashboard/{previewTab}</span>
              </div>

              <AnimatePresence mode="wait">
                {previewTab === "student" && (
                  <motion.div key="student" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <span className="text-xs text-purple-400 font-bold block mb-1">Recent Complaint</span>
                        <h4 className="font-bold text-sm">Ceiling Leakage CE-102</h4>
                        <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold bg-orange-500/20 text-orange-400">In Progress</span>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <span className="text-xs text-red-400 font-bold block mb-1">Active Alert</span>
                        <h4 className="font-bold text-sm">Medical Help Required</h4>
                        <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold bg-red-500/20 text-red-400">Dispatched</span>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <span className="text-xs text-blue-400 font-bold block mb-1">Library Booking</span>
                        <h4 className="font-bold text-sm">Computer Lab A - 2PM</h4>
                        <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold bg-emerald-500/20 text-emerald-400">Approved</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-3">
                      <h4 className="font-bold text-sm">Notice Board Feed</h4>
                      <div className="space-y-2">
                        <div className="text-xs flex justify-between p-2.5 rounded bg-black/25">
                          <span>📝 End Sem Exam Schedule Released</span>
                          <span className="text-muted-foreground">Today</span>
                        </div>
                        <div className="text-xs flex justify-between p-2.5 rounded bg-black/25">
                          <span>💼 TechCorp placement Drive - Batch 2026</span>
                          <span className="text-muted-foreground">Yesterday</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {previewTab === "faculty" && (
                  <motion.div key="faculty" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-3">
                        <h4 className="font-bold text-sm">Pending Resource Approvals</h4>
                        <div className="space-y-2">
                          <div className="p-3 rounded bg-black/25 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold">Auditorium - Drama Rehearsal</p>
                              <p className="text-[10px] text-muted-foreground">Requested by: Priya Sharma</p>
                            </div>
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded cursor-pointer font-bold">Approve</span>
                              <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded cursor-pointer font-bold">Reject</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-3">
                        <h4 className="font-bold text-sm">Active Surveys</h4>
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Teaching Quality Feedback</span>
                              <span className="font-bold">82% responses</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-primary rounded-full w-[82%]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {previewTab === "admin" && (
                  <motion.div key="admin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3.5 rounded-xl border border-white/5 bg-black/25 text-center">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Students</span>
                        <p className="text-2xl font-bold mt-1 text-primary">2,410</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-white/5 bg-black/25 text-center">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Faculty</span>
                        <p className="text-2xl font-bold mt-1 text-blue-400">84</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-white/5 bg-black/25 text-center">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Maintenance Staff</span>
                        <p className="text-2xl font-bold mt-1 text-orange-400">22</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-white/5 bg-black/25 text-center">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Admins</span>
                        <p className="text-2xl font-bold mt-1 text-emerald-400">4</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                      <h4 className="font-bold text-sm mb-3">Live System Activity Logs</h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex gap-2 text-muted-foreground py-1 border-b border-white/5">
                          <span className="text-primary font-semibold">[09:30]</span>
                          <span className="text-foreground">Student Arjun Verma reported AC malfunction in IT Lab 2</span>
                        </div>
                        <div className="flex gap-2 text-muted-foreground py-1 border-b border-white/5">
                          <span className="text-primary font-semibold">[08:45]</span>
                          <span className="text-foreground">Admin registered new faculty member Dr. MITchell</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS (TIMELINE) --- */}
        <section className="py-24 max-w-5xl mx-auto px-6 relative z-20">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              How <span className="gradient-text">CampusFlow</span> works.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-md">
              Trace the automated lifecycle of an reported campus issue from inception to final feedback resolution.
            </p>
          </div>

          <div className="space-y-10 relative before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:w-0.5 before:bg-white/10 before:h-full">
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 pl-10 md:pl-0">
              <div className="md:w-5/12 md:text-right">
                <span className="text-xs text-primary font-bold tracking-wider uppercase block mb-1">Step 1</span>
                <h4 className="text-xl font-bold mb-2">Report Campus Issues</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A student snaps a picture and submits a complaint with category tagging.
                </p>
              </div>
              <div className="absolute left-3.5 md:left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full border-4 border-black bg-primary glow-primary flex items-center justify-center z-10" />
              <div className="md:w-5/12" />
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 pl-10 md:pl-0">
              <div className="md:w-5/12" />
              <div className="absolute left-3.5 md:left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full border-4 border-black bg-primary glow-primary flex items-center justify-center z-10" />
              <div className="md:w-5/12">
                <span className="text-xs text-primary font-bold tracking-wider uppercase block mb-1">Step 2</span>
                <h4 className="text-xl font-bold mb-2">Administration Reviews</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Campus admin reviews details and assigns a response officer or maintenance worker.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 pl-10 md:pl-0">
              <div className="md:w-5/12 md:text-right">
                <span className="text-xs text-primary font-bold tracking-wider uppercase block mb-1">Step 3</span>
                <h4 className="text-xl font-bold mb-2">Staff Resolves Problem</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Faculty or maintenance staff carries out repairs and posts resolution comments.
                </p>
              </div>
              <div className="absolute left-3.5 md:left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full border-4 border-black bg-primary glow-primary flex items-center justify-center z-10" />
              <div className="md:w-5/12" />
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 pl-10 md:pl-0">
              <div className="md:w-5/12" />
              <div className="absolute left-3.5 md:left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full border-4 border-black bg-primary glow-primary flex items-center justify-center z-10" />
              <div className="md:w-5/12">
                <span className="text-xs text-primary font-bold tracking-wider uppercase block mb-1">Step 4</span>
                <h4 className="text-xl font-bold mb-2">Student Receives Update</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Student receives a real-time notification, reviews the work, and rates the experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS --- */}
        <section id="testimonials" className="py-24 border-t border-white/5 relative z-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Loved by <span className="gradient-text">students and staff.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-md">
                Here's what our campus residents say about the digital operations transformation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t, idx) => (
                <Card key={idx} className="glass-card border-white/5 p-4 flex flex-col justify-between h-full bg-black/20">
                  <CardContent className="p-0">
                    <div className="flex gap-1 mb-4 text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400" />)}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic mb-6">"{t.quote}"</p>
                  </CardContent>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs sm:text-sm">{t.author}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{t.role}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-24 text-center px-6 border-t border-white/5 relative overflow-hidden z-20">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Experience a <br />
              <span className="gradient-text">Smarter Campus?</span>
            </h2>
            <p className="text-sm sm:text-md text-muted-foreground max-w-xl mx-auto">
              Digitize classrooms, asset bookings, and maintenance operations. Join today to unlock seamless campus integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-6 rounded-xl text-md glow-primary" onClick={() => setStudentModalOpen(true)}>
                Enter as Student
              </Button>
              <Button size="lg" variant="outline" className="font-bold border border-white/10 px-8 py-6 rounded-xl text-md" onClick={() => setStaffModalOpen(true)}>
                Login as Staff/Admin
              </Button>
            </div>
          </motion.div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="py-8 text-center text-xs text-muted-foreground border-t border-white/5 z-20 bg-black/40">
          © {new Date().getFullYear()} CampusFlow Systems. Designed for institutional efficiency.
        </footer>

        {/* ====================================================
            STUDENT MODAL POPUP
            ==================================================== */}
        <Dialog open={studentModalOpen} onOpenChange={setStudentModalOpen}>
          <DialogContent className="glass-card border border-white/10 sm:max-w-[420px] bg-black/90 backdrop-blur-lg shadow-2xl p-6">
            <DialogHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-6.5 w-6.5" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Student Portal Access</DialogTitle>
              <DialogDescription>
                Provide details below. If your enrollment is not pre-registered, we will auto-generate your profile for the demo.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 h-10 text-sm focus:border-primary"
                  {...studentForm.register("name")}
                />
                {studentForm.formState.errors.name && (
                  <p className="text-[10px] text-red-400 font-semibold">{studentForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="enrollmentNumber" className="text-xs text-muted-foreground">Enrollment Number</Label>
                <Input
                  id="enrollmentNumber"
                  placeholder="ENR2024001"
                  className="bg-white/5 border-white/10 h-10 text-sm focus:border-primary"
                  {...studentForm.register("enrollmentNumber")}
                />
                {studentForm.formState.errors.enrollmentNumber && (
                  <p className="text-[10px] text-red-400 font-semibold">{studentForm.formState.errors.enrollmentNumber.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="collegeName" className="text-xs text-muted-foreground">College Name</Label>
                <Input
                  id="collegeName"
                  placeholder="State University of Technology"
                  className="bg-white/5 border-white/10 h-10 text-sm focus:border-primary"
                  {...studentForm.register("collegeName")}
                />
                {studentForm.formState.errors.collegeName && (
                  <p className="text-[10px] text-red-400 font-semibold">{studentForm.formState.errors.collegeName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="department" className="text-xs text-muted-foreground">Department</Label>
                  <Input
                    id="department"
                    placeholder="Computer Science"
                    className="bg-white/5 border-white/10 h-10 text-sm focus:border-primary"
                    {...studentForm.register("department")}
                  />
                  {studentForm.formState.errors.department && (
                    <p className="text-[10px] text-red-400 font-semibold">{studentForm.formState.errors.department.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="semester" className="text-xs text-muted-foreground">Semester</Label>
                  <Select onValueChange={(val) => studentForm.setValue("semester", val)} defaultValue={studentForm.getValues("semester")}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm focus:border-primary">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-white/10">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {studentForm.formState.errors.semester && (
                    <p className="text-[10px] text-red-400 font-semibold">{studentForm.formState.errors.semester.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-sm rounded-lg" disabled={studentEntry.isPending}>
                {studentEntry.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue To Dashboard
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <span className="text-[10px] text-muted-foreground cursor-pointer hover:text-white" onClick={fillStudentDemo}>
                💡 Click to Auto-fill Seed Student (Priya Sharma · ENR2024001)
              </span>
            </div>
          </DialogContent>
        </Dialog>

        {/* ====================================================
            STAFF / ADMIN MODAL POPUP
            ==================================================== */}
        <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
          <DialogContent className="glass-card border border-white/10 sm:max-w-[420px] bg-black/90 backdrop-blur-lg shadow-2xl p-6">
            <DialogHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6.5 w-6.5" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Staff & Administrator Access</DialogTitle>
              <DialogDescription>
                Sign in with your email. Select your institutional role to proceed.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@campusflow.demo"
                    className="bg-white/5 border-white/10 h-10 pl-9 text-sm focus:border-primary"
                    {...staffForm.register("email")}
                  />
                </div>
                {staffForm.formState.errors.email && (
                  <p className="text-[10px] text-red-400 font-semibold">{staffForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 h-10 pl-9 text-sm focus:border-primary"
                    {...staffForm.register("password")}
                  />
                </div>
                {staffForm.formState.errors.password && (
                  <p className="text-[10px] text-red-400 font-semibold">{staffForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="role" className="text-xs text-muted-foreground">Select Role</Label>
                <Select onValueChange={(val) => staffForm.setValue("role", val as any)} defaultValue={staffForm.getValues("role")}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm focus:border-primary">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10">
                    <SelectItem value="faculty">🎓 Faculty / Professor</SelectItem>
                    <SelectItem value="maintenance">🔧 Maintenance Crew</SelectItem>
                    <SelectItem value="admin">🛡️ Institutional Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {staffForm.formState.errors.role && (
                  <p className="text-[10px] text-red-400 font-semibold">{staffForm.formState.errors.role.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-11 text-sm rounded-lg glow-primary" disabled={staffLogin.isPending || adminLogin.isPending}>
                {staffLogin.isPending || adminLogin.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Login
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Demo Accounts (Click to auto-fill)</span>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="text-[9px] h-7 px-1 bg-white/5" onClick={() => fillDemo("admin@campusflow.demo", "admin123", "admin")}>🛡️ Admin</Button>
                <Button variant="outline" className="text-[9px] h-7 px-1 bg-white/5" onClick={() => fillDemo("sarah.mitchell@campusflow.demo", "faculty123", "faculty")}>🎓 Faculty</Button>
                <Button variant="outline" className="text-[9px] h-7 px-1 bg-white/5" onClick={() => fillDemo("carlos.rivera@campusflow.demo", "staff123", "maintenance")}>🔧 Maintenance</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </GradientBackground>
  );
}