import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-muted/20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center max-w-3xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary">
              Digitizing Farm Labor Management for Smarter Agriculture
            </h1>
            <p className="text-muted-foreground md:text-xl">
              AgriPro Manager helps farm owners and managers track attendance,
              assign tasks, monitor productivity, and automate payroll — all in
              one intelligent system.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
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
