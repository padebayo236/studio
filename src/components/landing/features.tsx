
import {
  Clock,
  ClipboardList,
  Tractor,
  DollarSign,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Clock,
    title: "Attendance Tracking",
    description: "Digital clock-in and clock-out with automatic hour calculation.",
  },
  {
    icon: ClipboardList,
    title: "Task Management",
    description: "Assign farm tasks to single or multiple workers and track completion status.",
  },
  {
    icon: Tractor,
    title: "Productivity Monitoring",
    description: "Measure output per worker and compare performance across different fields.",
  },
  {
    icon: DollarSign,
    title: "Payroll Automation",
    description: "Automated wage calculation based on hours worked or task-based payments.",
  },
  {
    icon: FileText,
    title: "Reporting & Analytics",
    description: "Generate detailed productivity reports and analyze labor cost efficiency.",
  },
  {
    icon: Users,
    title: "Worker Management",
    description: "Maintain detailed profiles for all your farm workers in one place.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
              Core Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need to Manage Your Farm Labor
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform provides a comprehensive suite of tools to help you
              manage your farm's workforce efficiently and effectively.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-start gap-4">
                <feature.icon className="h-8 w-8 text-primary" />
                <div className="space-y-1">
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
