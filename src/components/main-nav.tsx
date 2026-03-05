
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
import type { UserRole } from "@/lib/types"

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ['Admin', 'FarmManager', 'FarmWorker', 'Accountant'] },
  { href: "/workers", icon: Users, label: "Workers", roles: ['Admin', 'FarmManager', 'Accountant'] },
  { href: "/attendance", icon: Clock, label: "Attendance", roles: ['Admin', 'FarmManager', 'Accountant', 'FarmWorker'] },
  { href: "/tasks", icon: ClipboardList, label: "Tasks", roles: ['Admin', 'FarmManager', 'FarmWorker'] },
  { href: "/productivity", icon: Tractor, label: "Productivity", roles: ['Admin', 'FarmManager', 'Accountant', 'FarmWorker'] },
  { href: "/fields", icon: Map, label: "Fields", roles: ['Admin', 'FarmManager'] },
  { href: "/payroll", icon: DollarSign, label: "Payroll", roles: ['Admin', 'Accountant'] },
  { href: "/reports", icon: FileText, label: "Reports", roles: ['Admin', 'Accountant'] },
];


export function MainNav({ isMobile = false, role }: { isMobile?: boolean, role: UserRole }) {
  const pathname = usePathname()

  // For the dashboard link, we want it to be active for the dashboard route or the root (which redirects)
  const isDashboardActive = pathname === '/dashboard' || pathname === '/';

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  if (!role) return null;

  return (
    <nav className={cn("grid items-start px-4 text-sm font-medium", isMobile && "gap-2")}>
      {navItems.map((item) => {
        const isActive = item.href === '/dashboard' ? isDashboardActive : pathname.startsWith(item.href);
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
