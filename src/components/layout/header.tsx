'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { Target, BarChart3, Calendar, LogOut, Settings, UserPlus, Layers, LayoutDashboard } from 'lucide-react'
import { RatioIndicator } from '@/components/dashboard/RatioIndicator'
import { OrganizationSwitcher } from './organization-switcher'
import { useOrganization } from '@/components/providers/organization-provider'
import { getCurrentWeek } from '@/lib/week'

const navigation = [
  { name: 'Orchestration', href: '/dashboard/orchestration', icon: LayoutDashboard },
  { name: 'Le Plancher', href: '/dashboard/plancher', icon: Layers },
  { name: 'Les 4 Piliers', href: '/dashboard/piliers', icon: Target },
]

type HeaderProps = {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const { isAdmin } = useOrganization()
  const [weekNumber, setWeekNumber] = useState<number | null>(null)

  // Calculate week number on client only to avoid hydration mismatch
  useEffect(() => {
    setWeekNumber(getCurrentWeek().weekNumber)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo_icon_wordmark_dark.png"
              alt="C4DENCE"
              width={140}
              height={36}
              style={{ height: '36px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Ratio Indicator (C4DENCE v3.1) */}
          <div className="hidden xl:block ml-4">
            <RatioIndicator pillarsPercent={25} />
          </div>

          {/* Organization Switcher */}
          <OrganizationSwitcher />

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
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
          {weekNumber !== null && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <Calendar className="h-4 w-4 text-brand-cyan" />
              <span className="text-muted-foreground">Semaine</span>
              <span className="font-semibold text-foreground">{weekNumber}</span>
            </div>
          )}

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
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/members">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Gérer les membres
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
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
