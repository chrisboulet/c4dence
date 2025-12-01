'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Users,
  Target,
  Mail,
  MoreVertical,
  Trash2,
  UserMinus,
  Crown,
  Shield,
  User,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  adminGetOrganizationDetails,
  adminSendInvitation,
  adminCancelInvitation,
  adminUpdateMemberRole,
  adminRemoveMember,
} from '@/app/actions/admin'

interface PageProps {
  params: Promise<{ id: string }>
}

const roleConfig = {
  OWNER: { icon: Crown, label: 'Propriétaire', color: 'text-brand-gold' },
  ADMIN: { icon: Shield, label: 'Admin', color: 'text-brand-purple' },
  MEMBER: { icon: User, label: 'Membre', color: 'text-muted-foreground' },
}

export default function OrganizationDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteData, setInviteData] = useState({ email: '', role: 'MEMBER' as const })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removeMember, setRemoveMember] = useState<any>(null)
  const [cancelInvite, setCancelInvite] = useState<any>(null)

  const fetchOrganization = async () => {
    setIsLoading(true)
    const result = await adminGetOrganizationDetails(id)
    if (result.success) {
      setOrganization(result.data)
    } else {
      router.push('/admin')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchOrganization()
  }, [id])

  const handleInvite = async () => {
    if (!inviteData.email) return

    setIsSubmitting(true)
    const result = await adminSendInvitation(id, {
      email: inviteData.email,
      role: inviteData.role as 'OWNER' | 'ADMIN' | 'MEMBER',
    })
    if (result.success) {
      setIsInviteOpen(false)
      setInviteData({ email: '', role: 'MEMBER' })
      fetchOrganization()
    }
    setIsSubmitting(false)
  }

  const handleCancelInvite = async () => {
    if (!cancelInvite) return

    setIsSubmitting(true)
    await adminCancelInvitation(cancelInvite.id)
    setCancelInvite(null)
    setIsSubmitting(false)
    fetchOrganization()
  }

  const handleRemoveMember = async () => {
    if (!removeMember) return

    setIsSubmitting(true)
    await adminRemoveMember(removeMember.id)
    setRemoveMember(null)
    setIsSubmitting(false)
    fetchOrganization()
  }

  const handleRoleChange = async (membershipId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') => {
    await adminUpdateMemberRole(membershipId, role)
    fetchOrganization()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!organization) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">
            Créée le {new Date(organization.createdAt).toLocaleDateString('fr-CA')}
          </p>
        </div>
        {!organization.isActive && (
          <Badge variant="secondary" className="ml-2">Désactivée</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Membres</CardTitle>
              </div>
              <Button size="sm" onClick={() => setIsInviteOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Inviter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organization.memberships.map((membership: any) => {
                const RoleIcon = roleConfig[membership.role as keyof typeof roleConfig].icon
                return (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={membership.profile.avatarUrl} />
                        <AvatarFallback>
                          {membership.profile.fullName?.[0] || membership.profile.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {membership.profile.fullName || membership.profile.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{membership.profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={membership.role}
                        onValueChange={(value) => handleRoleChange(membership.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OWNER">Propriétaire</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Membre</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveMember(membership)}
                      >
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pending Invitations */}
            {organization.invitations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Invitations en attente
                </h4>
                <div className="space-y-2">
                  {organization.invitations.map((invite: any) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-dashed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expire le {new Date(invite.expiresAt).toLocaleDateString('fr-CA')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{roleConfig[invite.role as keyof typeof roleConfig].label}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCancelInvite(invite)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Objectifs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Objectifs ({organization.objectives?.length || organization.wigs?.length || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {(organization.objectives?.length || organization.wigs?.length || 0) === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun Objectif créé
              </p>
            ) : (
              <div className="space-y-2">
                {(organization.objectives || organization.wigs || []).map((objective: any) => (
                  <div
                    key={objective.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{objective.name}</span>
                      {objective.isArchived && (
                        <Badge variant="secondary">Archivé</Badge>
                      )}
                    </div>
                    <Badge
                      variant={
                        objective.status === 'ON_TRACK' ? 'on-track' :
                        objective.status === 'AT_RISK' ? 'at-risk' : 'off-track'
                      }
                    >
                      {objective.status === 'ON_TRACK' ? 'En bonne voie' :
                       objective.status === 'AT_RISK' ? 'À risque' :
                       objective.status === 'ACHIEVED' ? 'Atteint' : 'Hors piste'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
            <DialogDescription>
              Envoyez une invitation par email pour rejoindre {organization.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="utilisateur@example.com"
                value={inviteData.email}
                onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Rôle</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) => setInviteData({ ...inviteData, role: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Propriétaire</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Membre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleInvite} disabled={isSubmitting || !inviteData.email}>
              {isSubmitting ? 'Envoi...' : 'Envoyer invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removeMember} onOpenChange={() => setRemoveMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeMember?.profile.fullName || removeMember?.profile.email} sera retiré de {organization.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Confirmation */}
      <AlertDialog open={!!cancelInvite} onOpenChange={() => setCancelInvite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette invitation ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'invitation pour {cancelInvite?.email} sera annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Garder</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvite}>
              Annuler invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
