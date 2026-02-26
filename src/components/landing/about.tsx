
import { Leaf, BarChart } from "lucide-react";

export function LandingAbout() {
  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
              About The System
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              What is AgriPro Manager?
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              AgriPro Manager is a web-based system designed to improve farm
              labor efficiency through structured digital management. It replaces
              manual notebooks and spreadsheets with real-time data tracking and
              performance analytics, empowering you to make smarter decisions for
              your farm.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <Leaf className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Streamline Operations</h3>
                <p className="text-muted-foreground">
                  From attendance to payroll, centralize your farm's labor
                  management in one intuitive platform.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BarChart className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Unlock Insights</h3>
                <p className="text-muted-foreground">
                  Gain valuable insights into worker productivity and field
                  performance with our powerful analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
