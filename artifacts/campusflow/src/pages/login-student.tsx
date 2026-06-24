import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { campusUserStore } from "@/lib/campus-store";

const studentLoginSchema = z.object({
  enrollmentNumber: z.string().min(3, "Enrollment number is required"),
});

export default function StudentLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof studentLoginSchema>>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      enrollmentNumber: "",
    },
  });

  const onSubmit = (values: z.infer<typeof studentLoginSchema>) => {
    // Find student in local store
    const existing = campusUserStore
      .getAll()
      .find(
        (u) =>
          u.role === "student" &&
          u.enrollmentNumber === values.enrollmentNumber,
      );

    if (existing) {
      login(`mock-token-${existing.enrollmentNumber}`, {
        id: existing.id,
        name: existing.name,
        role: "student",
        email: existing.email || null,
        enrollmentNumber: existing.enrollmentNumber || null,
        collegeName: existing.collegeName || null,
        department: existing.department || null,
        semester: existing.semester || null,
        createdAt: existing.createdAt,
      });
      toast({
        title: "Welcome back",
        description: `Successfully logged in as ${existing.name}.`,
      });
      setLocation("/dashboard/student");
    } else {
      // Auto-register sandbox student
      toast({
        title: "Creating sandbox student",
        description:
          "Enrollment not found. Auto-registering a profile in local storage.",
      });

      const localUser = campusUserStore.create({
        name: `Student ${values.enrollmentNumber}`,
        email: `${values.enrollmentNumber.toLowerCase()}@campusflow.demo`,
        role: "student",
        enrollmentNumber: values.enrollmentNumber,
        collegeName: "State University of Technology",
        department: "Computer Science",
        semester: 4,
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

      toast({
        title: "Welcome to CampusFlow",
        description: `Logged in as ${localUser.name}`,
      });
      setLocation("/dashboard/student");
    }
  };

  return (
    <GradientBackground>
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Student Portal
              </CardTitle>
              <CardDescription>
                Enter your enrollment number to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="enrollmentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="STU-2023-001"
                            {...field}
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Access Portal
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </GradientBackground>
  );
}
