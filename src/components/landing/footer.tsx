
import Link from "next/link";
import { AgriProLogo } from "@/components/icons";

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="flex items-center gap-2">
            <AgriProLogo className="h-5 w-5" />
            <p className="text-xs text-muted-foreground">
                &copy; {year} AgriPro Manager. All rights reserved.
            </p>
        </div>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link
          href="#features"
          className="text-xs hover:underline underline-offset-4"
        >
          Features
        </Link>
        <Link
          href="/login"
          className="text-xs hover:underline underline-offset-4"
        >
          Login
        </Link>
      </nav>
    </footer>
  );
}
