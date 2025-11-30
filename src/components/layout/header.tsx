'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Target, BarChart3, Users, Calendar, LogOut, Settings, Menu } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'WIGs', href: '/dashboard/wigs', icon: Target },
  { name: 'Cadence', href: '/dashboard/cadence', icon: Calendar },
]

type HeaderProps = {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-lg gradient-purple-cyan flex items-center justify-center">
              <span className="text-lg font-bold text-white">C4</span>
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">
              C4DENCE
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Week indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
            <Calendar className="h-4 w-4 text-brand-cyan" />
            <span className="text-muted-foreground">Semaine</span>
            <span className="font-semibold text-foreground">
              {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}
            </span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="h-8 w-8 rounded-full gradient-purple-cyan flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {userEmail?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm max-w-32 truncate">
                  {userEmail?.split('@')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
