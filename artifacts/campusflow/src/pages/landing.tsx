import { Link } from "wouter";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, ShieldCheck, ArrowRight, Activity, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen">
        <header className="glass-nav px-6 py-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center glow-primary">
              <div className="w-4 h-4 rounded-sm bg-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">CampusFlow</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login/admin">
              <Button variant="ghost">Admin Portal</Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mb-16"
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-white/10 bg-white/5 backdrop-blur-md">
              <span className="text-primary mr-2">New</span> V2 Platform Release
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Where campus life <br/>
              <span className="gradient-text">flows smoothly.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              An elegant, institutional-grade platform for modern universities. Bring students, faculty, and administration together in one intelligent ecosystem.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
          >
            <Card className="glass-card border-none hover:-translate-y-1 transition-transform duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Students</CardTitle>
                <CardDescription className="text-base">Passwordless entry with enrollment number</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login/student">
                  <Button className="w-full group" variant="secondary">
                    Student Entry
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card border-none hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Faculty & Staff</CardTitle>
                <CardDescription className="text-base">Manage classes, tasks, and campus life</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Link href="/login/staff">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group">
                    Staff Login
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card border-none hover:-translate-y-1 transition-transform duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Administration</CardTitle>
                <CardDescription className="text-base">Secure institutional management</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login/admin">
                  <Button className="w-full group" variant="secondary">
                    Admin Access
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <footer className="py-8 text-center text-sm text-muted-foreground z-20">
          © {new Date().getFullYear()} CampusFlow Institutional Systems
        </footer>
      </div>
    </GradientBackground>
  );
}

function Badge({ children, className, variant = "default" }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  )
}