'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useOrganization } from '@/components/providers/organization-provider'
import { getOrganizationMembers, getPendingInvitations, inviteMember, removeMember, cancelInvitation } from '@/app/actions/organization'
import { getRoleLabel } from '@/lib/role-utils'
import { Crown, Shield, User, UserPlus, Trash2, Mail, Clock, Loader2, AlertCircle } from 'lucide-react'
import type { MemberRole } from '@prisma/client'

type Member = {
  id: string
  role: MemberRole
  profile: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  }
}

type Invitation = {
  id: string
  email: string
  role: MemberRole
  expiresAt: Date
  createdAt: Date
}

function getRoleIcon(role: MemberRole) {
  switch (role) {
    case 'OWNER':
      return <Crown className="h-4 w-4 text-yellow-500" />
    case 'ADMIN':
      return <Shield className="h-4 w-4 text-brand-purple" />
    case 'MEMBER':
      return <User className="h-4 w-4 text-muted-foreground" />
  }
}

function getRoleBadgeVariant(role: MemberRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'OWNER':
      return 'default'
    case 'ADMIN':
      return 'secondary'
    case 'MEMBER':
      return 'outline'
  }
}

export default function MembersPage() {
  const router = useRouter()
  const { currentOrg, isAdmin, currentRole } = useOrganization()
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('MEMBER')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    if (currentOrg) {
      loadData()
    }
  }, [currentOrg, isAdmin, router])

  async function loadData() {
    if (!currentOrg) return

    setIsLoading(true)
    try {
      const [membersResult, invitationsResult] = await Promise.all([
        getOrganizationMembers(currentOrg.organizationId),
        getPendingInvitations(currentOrg.organizationId),
      ])

      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data as Member[])
      }

      if (invitationsResult.success && invitationsResult.data) {
        setInvitations(invitationsResult.data as Invitation[])
      }
    } catch (err) {
      console.error('Error loading members:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!currentOrg) return

    setError(null)
    startTransition(async () => {
      const result = await inviteMember({
        organizationId: currentOrg.organizationId,
        email: inviteEmail,
        role: inviteRole,
      })

      if (result.success) {
        setInviteEmail('')
        setInviteRole('MEMBER')
        setInviteOpen(false)
        loadData()
      } else {
        setError(result.error || "Erreur lors de l'envoi de l'invitation")
      }
    })
  }

  async function handleRemoveMember(membershipId: string) {
    if (!confirm('Voulez-vous vraiment retirer ce membre?')) return

    startTransition(async () => {
      const result = await removeMember(membershipId)
      if (result.success) {
        loadData()
      } else {
        alert(result.error || 'Erreur lors de la suppression')
      }
    })
  }

  async function handleCancelInvitation(invitationId: string) {
    if (!confirm('Voulez-vous vraiment annuler cette invitation?')) return

    startTransition(async () => {
      const result = await cancelInvitation(invitationId)
      if (result.success) {
        loadData()
      } else {
        alert(result.error || "Erreur lors de l'annulation")
      }
    })
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Gestion des membres</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les membres et invitations de {currentOrg?.organization.name}
          </p>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-purple-cyan">
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un membre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un nouveau membre</DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email pour rejoindre l'organisation.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInvite} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="membre@exemple.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value: string) => setInviteRole(value as MemberRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Membre - Peut mettre à jour les valeurs et engagements
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin - Peut créer et gérer les WIGs
                      </div>
                    </SelectItem>
                    {currentRole === 'OWNER' && (
                      <SelectItem value="OWNER">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Propriétaire - Accès complet
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer l'invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Membres ({members.length})
              </CardTitle>
              <CardDescription>
                Les membres actuels de l'organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun membre</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full gradient-purple-cyan flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {(member.profile.fullName || member.profile.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.profile.fullName || member.profile.email.split('@')[0]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.profile.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            {getRoleLabel(member.role)}
                          </span>
                        </Badge>

                        {member.role !== 'OWNER' && currentRole === 'OWNER' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitations en attente ({invitations.length})
              </CardTitle>
              <CardDescription>
                Les invitations qui n'ont pas encore été acceptées
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucune invitation en attente</p>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-purple/20 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-brand-purple" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expire le{' '}
                            {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(invitation.role)}>
                          {getRoleLabel(invitation.role)}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions par rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Propriétaire</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>Accès complet à l'organisation</li>
                <li>Peut supprimer des membres</li>
                <li>Peut transférer la propriété</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-purple" />
                <span className="font-medium">Administrateur</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>Créer et modifier les WIGs</li>
                <li>Créer des Lead Measures</li>
                <li>Inviter des membres</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Membre</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>Voir les WIGs et mesures</li>
                <li>Mettre à jour les valeurs</li>
                <li>Gérer ses engagements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
