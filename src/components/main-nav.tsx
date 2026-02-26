
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Tractor,
  Warehouse,
  FileText,
  DollarSign,
  Settings,
  Clock,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/workers", icon: Users, label: "Workers" },
  { href: "/attendance", icon: Clock, label: "Attendance" },
  { href: "/tasks", icon: ClipboardList, label: "Tasks" },
  { href: "/productivity", icon: Tractor, label: "Productivity" },
  { href: "/fields", icon: Warehouse, label: "Fields" },
  { href: "/payroll", icon: DollarSign, label: "Payroll" },
  { href: "#", icon: FileText, label: "Reports" },
];

export function MainNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn("grid items-start px-4 text-sm font-medium", isMobile && "gap-2")}>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
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
