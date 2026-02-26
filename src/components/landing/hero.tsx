
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/10 dark:to-green-900/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-primary">
              Digitizing Farm Labor Management for Smarter Agriculture
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              AgriPro Manager helps farm owners and managers track attendance,
              assign tasks, monitor productivity, and automate payroll — all in
              one intelligent system.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/login" passHref>
              <Button size="lg">Login</Button>
            </Link>
            <Link href="#features" passHref>
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
