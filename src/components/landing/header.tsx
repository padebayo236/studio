
import Link from 'next/link';
import { AgriProLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
                <AgriProLogo className="h-6 w-6 text-primary" />
                <span className="font-bold sm:inline-block">
                AgriPro Manager
                </span>
            </Link>
        </div>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          <Link
            href="#features"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            How It Works
          </Link>
          <Link
            href="#benefits"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Benefits
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Link href="/login" passHref>
              <Button>Login</Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-4">
                    <Link href="/" className="mb-8 flex items-center space-x-2">
                        <AgriProLogo className="h-6 w-6 text-primary" />
                        <span className="font-bold">AgriPro Manager</span>
                    </Link>
                    <nav className="flex flex-col space-y-4">
                        <Link href="#features" className="text-lg font-medium">Features</Link>
                        <Link href="#how-it-works" className="text-lg font-medium">How It Works</Link>
                        <Link href="#benefits" className="text-lg font-medium">Benefits</Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
