
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Tractor,
  FileText,
  DollarSign,
  Settings,
  Clock,
  Map,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/workers", icon: Users, label: "Workers" },
  { href: "/attendance", icon: Clock, label: "Attendance" },
  { href: "/tasks", icon: ClipboardList, label: "Tasks" },
  { href: "/productivity", icon: Tractor, label: "Productivity" },
  { href: "/fields", icon: Map, label: "Fields" },
  { href: "/payroll", icon: DollarSign, label: "Payroll" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

export function MainNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname()

  // For the dashboard link, we want it to be active for the root route "/"
  const isDashboardActive = pathname === '/';

  return (
    <nav className={cn("grid items-start px-4 text-sm font-medium", isMobile && "gap-2")}>
      {navItems.map((item) => {
        const isActive = item.href === '/' ? isDashboardActive : pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
       <div className="my-4 border-t border-border/20"></div>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
    </nav>
  )
}
