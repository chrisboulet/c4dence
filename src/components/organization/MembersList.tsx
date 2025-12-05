'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberRole } from "@prisma/client"
import { MoreHorizontal, Shield, User, UserMinus } from "lucide-react"

export interface MemberWithProfile {
    id: string
    role: MemberRole
    profile: {
        id: string
        email: string
        fullName: string | null
        avatarUrl: string | null
    }
}

interface MembersListProps {
    members: MemberWithProfile[]
    currentUserId: string
    onUpdateRole?: (memberId: string, newRole: MemberRole) => void
    onRemoveMember?: (memberId: string) => void
}

const ROLE_LABELS: Record<MemberRole, string> = {
    OWNER: 'Propriétaire',
    ADMIN: 'Administrateur',
    MEMBER: 'Membre'
}

const ROLE_COLORS: Record<MemberRole, "default" | "secondary" | "destructive" | "outline"> = {
    OWNER: 'default',
    ADMIN: 'secondary',
    MEMBER: 'outline'
}

export function MembersList({ members, currentUserId, onUpdateRole, onRemoveMember }: MembersListProps) {
    // Sort members: OWNER first, then ADMIN, then MEMBER
    const sortedMembers = [...members].sort((a, b) => {
        const order = { OWNER: 0, ADMIN: 1, MEMBER: 2 }
        return order[a.role] - order[b.role]
    })

    // Determine if current user can manage others
    const currentUser = members.find(m => m.profile.id === currentUserId)
    const canManage = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN'

    return (
        <div className="space-y-4">
            {sortedMembers.map((member) => (
                <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={member.profile.avatarUrl || ''} />
                            <AvatarFallback>
                                {member.profile.fullName?.charAt(0).toUpperCase() || member.profile.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium leading-none">{member.profile.fullName || 'Sans nom'}</p>
                            <p className="text-sm text-muted-foreground">{member.profile.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge variant={ROLE_COLORS[member.role]}>
                            {ROLE_LABELS[member.role]}
                        </Badge>

                        {canManage && member.profile.id !== currentUserId && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {member.role !== 'ADMIN' && (
                                        <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'ADMIN')}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Promouvoir Admin
                                        </DropdownMenuItem>
                                    )}

                                    {member.role !== 'MEMBER' && (
                                        <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'MEMBER')}>
                                            <User className="mr-2 h-4 w-4" />
                                            Rétrograder Membre
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onRemoveMember?.(member.id)}
                                    >
                                        <UserMinus className="mr-2 h-4 w-4" />
                                        Retirer de l'organisation
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
