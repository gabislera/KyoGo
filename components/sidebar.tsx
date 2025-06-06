"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { LayoutDashboard, Dumbbell, CheckCircle, PlusCircle, LogOut } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdmin = user?.role === "ADMIN"

  const routes = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Gyms",
      icon: <Dumbbell className="h-5 w-5" />,
      href: "/dashboard/gyms",
      active: pathname === "/dashboard/gyms",
    },
    {
      label: "Check-ins",
      icon: <CheckCircle className="h-5 w-5" />,
      href: "/dashboard/check-ins",
      active: pathname === "/dashboard/check-ins",
    },
  ]

  // Admin-only routes
  const adminRoutes = [
    {
      label: "Create Gym",
      icon: <PlusCircle className="h-5 w-5" />,
      href: "/dashboard/gyms/create",
      active: pathname === "/dashboard/gyms/create",
    },
  ]

  return (
    <div className="h-full flex flex-col bg-card border-r border-border w-full md:w-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold">GymTrack</h1>
        <p className="text-muted-foreground text-sm mt-1">Fitness tracking made simple</p>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={route.active ? "secondary" : "ghost"}
            className={cn("w-full justify-start", route.active ? "bg-secondary" : "")}
            asChild
          >
            <Link href={route.href}>
              {route.icon}
              <span className="ml-3">{route.label}</span>
            </Link>
          </Button>
        ))}

        {isAdmin &&
          adminRoutes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "secondary" : "ghost"}
              className={cn("w-full justify-start", route.active ? "bg-secondary" : "")}
              asChild
            >
              <Link href={route.href}>
                {route.icon}
                <span className="ml-3">{route.label}</span>
              </Link>
            </Button>
          ))}
      </div>
      <div className="p-3 mt-auto border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
          <LogOut className="h-5 w-5 mr-3" />
          Log out
        </Button>
      </div>
    </div>
  )
}
