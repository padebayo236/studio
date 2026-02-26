
import Link from "next/link";
import { AgriProLogo } from "@/components/icons";

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row md:py-8">
        <div className="flex items-center gap-2">
            <AgriProLogo className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">
                &copy; {year} AgriPro Manager. All rights reserved.
            </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
            <Link
            href="#features"
            className="text-sm hover:underline underline-offset-4 text-muted-foreground"
            >
            Features
            </Link>
            <Link
            href="/login"
            className="text-sm hover:underline underline-offset-4 text-muted-foreground"
            >
            Login
            </Link>
        </nav>
      </div>
    </footer>
  );
}
