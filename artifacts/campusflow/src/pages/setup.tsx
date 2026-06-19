import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetSetupStatus, useCreateAdminSetup, getGetSetupStatusQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradientBackground } from "@/components/layout/GradientBackground";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const setupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Setup() {
  const [, setLocation] = useLocation();
  const { data: setupStatus, isLoading } = useGetSetupStatus();
  const createAdmin = useCreateAdminSetup();
  const { toast } = useToast();
  const { login } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (setupStatus?.setupComplete) {
      setLocation("/login/admin");
    }
  }, [setupStatus, setLocation]);

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof setupSchema>) => {
    createAdmin.mutate({ data: values }, {
      onSuccess: (response) => {
        login(response.token, response.user);
        toast({ title: "Setup complete", description: "Admin account created successfully." });
        queryClient.invalidateQueries({ queryKey: getGetSetupStatusQueryKey() });
        setLocation("/dashboard/admin");
      },
      onError: (error: any) => {
        toast({ title: "Setup failed", description: error.message || "An error occurred", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </GradientBackground>
    );
  }

  if (setupStatus?.setupComplete) {
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
              <CardTitle className="text-2xl font-bold tracking-tight">System Setup</CardTitle>
              <CardDescription>
                Create the initial CampusFlow administrator account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} className="bg-background/50 backdrop-blur-sm" />
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
                          <Input type="email" placeholder="admin@university.edu" {...field} className="bg-background/50 backdrop-blur-sm" />
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
                          <Input type="password" {...field} className="bg-background/50 backdrop-blur-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createAdmin.isPending}>
                    {createAdmin.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
