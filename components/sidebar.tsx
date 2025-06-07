"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { LayoutDashboard, Dumbbell, CheckCircle, PlusCircle, LogOut, JapaneseYen, User, EllipsisVertical, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const routes = [
    {
      label: "Painel",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Academias",
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

  const adminRoutes = [
    {
      label: "Criar Academia",
      icon: <PlusCircle className="h-5 w-5" />,
      href: "/dashboard/gyms/create",
      active: pathname === "/dashboard/gyms/create",
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-card border-r border-border w-64">
      <div className="p-4 border-b border-red-500/20 flex items-center space-x-2">
        <JapaneseYen className="w-6 h-6 text-rose-500" />
        <h1 className="text-2xl font-bold">KyoGo</h1>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={route.active ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              route.active ? "bg-zinc-900 text-rose-500 border-l-2 border-red-500" : "hover:bg-zinc-900",
            )}
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
              className={cn(
                "w-full justify-start",
                route.active ? "bg-zinc-900 text-rose-500 border-l-2 border-red-500" : "hover:bg-zinc",
              )}
              asChild
            >
              <Link href={route.href}>
                {route.icon}
                <span className="ml-3">{route.label}</span>
              </Link>
            </Button>
          ))}
      </div>
      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-transparent w-full justify-start"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      {/* Barra lateral para desktop */}
      <div className="hidden md:flex h-[calc(100% - 65px)]">
        <SidebarContent />
      </div>

      {/* Botão da barra lateral para mobile */}
      <div className="md:hidden p-4 flex items-center justify-between border-b border-red-500/20">
        <div className="flex items-center space-x-2">
          <JapaneseYen className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-bold">KyoGo</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
