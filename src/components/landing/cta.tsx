import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/40">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Modernize Your Farm Operations?
          </h2>
          <p className="text-muted-foreground md:text-xl/relaxed">
            Start managing your farm labor digitally with AgriPro Manager.
            Login to your account to get started.
          </p>
          <div className="mt-4">
            <Link href="/login" passHref>
                <Button size="lg">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
