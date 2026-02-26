
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/90 text-primary-foreground">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Ready to Modernize Your Farm Operations?
          </h2>
          <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Start managing your farm labor digitally with AgriPro Manager.
            Login to your account to get started.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
            <Link href="/login" passHref>
                <Button size="lg" className="w-full" variant="secondary">Login</Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
