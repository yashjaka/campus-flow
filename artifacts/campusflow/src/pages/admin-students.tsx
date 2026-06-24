import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { campusUserStore } from "@/lib/campus-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  enrollmentNumber: z.string().min(3, "Enrollment number is required"),
  collegeName: z.string().min(2, "College name is required"),
  department: z.string().min(2, "Department is required"),
  semester: z.coerce.number().min(1).max(10),
});

export default function AdminStudents() {
  const [students, setStudents] = useState(() =>
    campusUserStore.getByRole("student"),
  );
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      enrollmentNumber: "",
      collegeName: "",
      department: "",
      semester: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof studentSchema>) => {
    campusUserStore.create({
      name: values.name,
      email: `${values.enrollmentNumber.toLowerCase()}@campusflow.demo`,
      enrollmentNumber: values.enrollmentNumber,
      collegeName: values.collegeName,
      department: values.department,
      semester: Number(values.semester),
      role: "student",
      isActive: true,
    });
    setStudents(campusUserStore.getByRole("student"));
    toast({ title: "Student created successfully" });
    setOpen(false);
    form.reset();
  };

  const filteredStudents = students?.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground mt-1">
              Manage student enrollments and records.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Register Student
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Register New Student</DialogTitle>
                <DialogDescription>
                  Enter the student's academic details. They will be able to log
                  in using their enrollment number.
                </DialogDescription>
              </DialogHeader>
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
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enrollmentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment Number</FormLabel>
                        <FormControl>
                          <Input placeholder="STU-2023-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="collegeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semester</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit">Register Student</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-background/50 border-white/10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Enrollment No.</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Semester</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents?.length === 0 ? (
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No students found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents?.map((student) => (
                      <TableRow
                        key={student.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {student.enrollmentNumber}
                        </TableCell>
                        <TableCell>{student.collegeName}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell className="text-right">
                          {student.semester}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
