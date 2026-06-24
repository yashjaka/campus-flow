import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { campusUserStore } from "@/lib/campus-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const setupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Setup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // Setup is complete if an admin user already exists
  const setupComplete = campusUserStore.getByRole("admin").length > 0;

  useEffect(() => {
    if (setupComplete) {
      setLocation("/login/admin");
    }
  }, [setupComplete, setLocation]);

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof setupSchema>) => {
    // Create admin user locally
    const localUser = campusUserStore.create({
      name: values.name,
      email: values.email,
      role: "admin",
      department: "Administration",
      isActive: true,
    });

    login(`mock-token-${localUser.id}`, {
      id: localUser.id,
      name: localUser.name,
      role: "admin",
      email: localUser.email || null,
      enrollmentNumber: localUser.enrollmentNumber || null,
      collegeName: localUser.collegeName || null,
      department: localUser.department || null,
      semester: localUser.semester || null,
      createdAt: localUser.createdAt,
    });

    toast({
      title: "Setup complete",
      description: "Admin account created successfully.",
    });

    setLocation("/dashboard/admin");
  };

  if (setupComplete) {
    return null; // Will redirect in useEffect
  }

  return (
    <GradientBackground>
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-none shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center glow-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                System Setup
              </CardTitle>
              <CardDescription>
                Create the initial CampusFlow administrator account.
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Doe"
                            {...field}
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@university.edu"
                            {...field}
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            className="bg-background/50 backdrop-blur-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Complete Setup
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
