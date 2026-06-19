import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useStudentEntry } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const studentLoginSchema = z.object({
  enrollmentNumber: z.string().min(3, "Enrollment number is required"),
});

export default function StudentLogin() {
  const [, setLocation] = useLocation();
  const studentEntry = useStudentEntry();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof studentLoginSchema>>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      enrollmentNumber: "",
    },
  });

  const onSubmit = (values: z.infer<typeof studentLoginSchema>) => {
    studentEntry.mutate({ data: values }, {
      onSuccess: (response) => {
        login(response.token, response.user);
        toast({ title: "Welcome back", description: "Successfully logged in." });
        setLocation("/dashboard/student");
      },
      onError: (error: any) => {
        toast({ title: "Login failed", description: error.message || "Invalid enrollment number.", variant: "destructive" });
      }
    });
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
            <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
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
              <CardTitle className="text-2xl font-bold tracking-tight">Student Portal</CardTitle>
              <CardDescription>
                Enter your enrollment number to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enrollmentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment Number</FormLabel>
                        <FormControl>
                          <Input placeholder="STU-2023-001" {...field} className="bg-background/50 backdrop-blur-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={studentEntry.isPending}>
                    {studentEntry.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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