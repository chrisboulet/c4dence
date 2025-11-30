'use client'

import { Building2, Check, ChevronDown, Crown, Shield, User, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganization } from '@/components/providers/organization-provider'
import type { MemberRole } from '@/types'

function getRoleConfig(role: MemberRole) {
  switch (role) {
    case 'OWNER':
      return {
        label: 'Propriétaire',
        icon: Crown,
        color: 'text-brand-gold',
      }
    case 'ADMIN':
      return {
        label: 'Admin',
        icon: Shield,
        color: 'text-brand-purple',
      }
    default:
      return {
        label: 'Membre',
        icon: User,
        color: 'text-muted-foreground',
      }
  }
}

export function OrganizationSwitcher() {
  const { currentOrg, setCurrentOrg, userMemberships, isLoading } = useOrganization()

  if (isLoading) {
    return <Skeleton className="h-9 w-40" />
  }

  if (!currentOrg || userMemberships.length === 0) {
    return null
  }

  const roleConfig = getRoleConfig(currentOrg.role)
  const RoleIcon = roleConfig.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 h-9">
          <div className="p-1.5 rounded-md bg-secondary">
            <Building2 className="h-4 w-4 text-brand-purple" />
          </div>
          <span className="max-w-32 truncate font-medium hidden sm:block">
            {currentOrg.organization.name}
          </span>
          <Badge variant="outline" className="hidden md:flex gap-1 text-xs">
            <RoleIcon className={`h-3 w-3 ${roleConfig.color}`} />
            {roleConfig.label}
          </Badge>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Mes organisations</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userMemberships.map((membership) => {
          const config = getRoleConfig(membership.role)
          const Icon = config.icon
          const isSelected = membership.organizationId === currentOrg.organizationId

          return (
            <DropdownMenuItem
              key={membership.id}
              onClick={() => setCurrentOrg(membership)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{membership.organization.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                {isSelected && <Check className="h-4 w-4 text-brand-cyan" />}
              </div>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding" className="flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4 text-brand-cyan" />
            <span>Créer une organisation</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
