import {
  Clock,
  ClipboardList,
  Tractor,
  DollarSign,
  FileText,
  Users,
} from "lucide-react";

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
    <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-muted/40">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Core Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need to Manage Your Farm Labor
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform provides a comprehensive suite of tools to help you
              manage your farm's workforce efficiently and effectively.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
