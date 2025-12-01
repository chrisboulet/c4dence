'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Users, Target, MoreVertical, Power, Trash2, Eye, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  adminGetAllOrganizations,
  adminCreateOrganization,
  adminToggleOrganization,
  adminDeleteOrganization,
} from '@/app/actions/admin'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  memberCount: number
  wigCount: number
  owner: { fullName: string | null; email: string } | null
}

export default function AdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null)
  const [newOrg, setNewOrg] = useState({ name: '', ownerEmail: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchOrganizations = async () => {
    setIsLoading(true)
    const result = await adminGetAllOrganizations()
    if (result.success) {
      setOrganizations(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const handleCreate = async () => {
    if (!newOrg.name || !newOrg.ownerEmail) return

    setIsSubmitting(true)
    const result = await adminCreateOrganization(newOrg)
    if (result.success) {
      setIsCreateOpen(false)
      setNewOrg({ name: '', ownerEmail: '' })
      fetchOrganizations()
    }
    setIsSubmitting(false)
  }

  const handleToggle = async (org: Organization) => {
    await adminToggleOrganization(org.id)
    fetchOrganizations()
  }

  const handleDelete = async () => {
    if (!deleteOrg) return

    setIsSubmitting(true)
    await adminDeleteOrganization(deleteOrg.id)
    setDeleteOrg(null)
    setIsSubmitting(false)
    fetchOrganizations()
  }

  const activeCount = organizations.filter(o => o.isActive).length
  const totalMembers = organizations.reduce((sum, o) => sum + o.memberCount, 0)
  const totalWigs = organizations.reduce((sum, o) => sum + o.wigCount, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Organisations</CardDescription>
            <CardTitle className="text-3xl">{organizations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actives</CardDescription>
            <CardTitle className="text-3xl text-brand-cyan">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Membres</CardDescription>
            <CardTitle className="text-3xl">{totalMembers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total WIGs</CardDescription>
            <CardTitle className="text-3xl">{totalWigs}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organisations</CardTitle>
              <CardDescription>Gérez toutes les organisations de la plateforme</CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle organisation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Aucune organisation</h3>
              <p className="text-muted-foreground mt-1">
                Créez la première organisation pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {organizations.map(org => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${org.isActive ? 'bg-brand-cyan/10' : 'bg-muted'}`}>
                      <Building2 className={`h-5 w-5 ${org.isActive ? 'text-brand-cyan' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{org.name}</h3>
                        {!org.isActive && (
                          <Badge variant="secondary">Désactivée</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {org.owner?.fullName || org.owner?.email || 'Pas de propriétaire'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {org.memberCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {org.wigCount}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/organizations/${org.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(org)}>
                          <Power className="mr-2 h-4 w-4" />
                          {org.isActive ? 'Désactiver' : 'Activer'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteOrg(org)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle organisation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle organisation et invitez son propriétaire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'organisation</Label>
              <Input
                id="name"
                placeholder="FLB Solutions Alimentaires"
                value={newOrg.name}
                onChange={e => setNewOrg({ ...newOrg, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email du propriétaire</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@company.com"
                value={newOrg.ownerEmail}
                onChange={e => setNewOrg({ ...newOrg, ownerEmail: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Une invitation sera envoyée si l'utilisateur n'existe pas encore
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting || !newOrg.name || !newOrg.ownerEmail}>
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteOrg} onOpenChange={() => setDeleteOrg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deleteOrg?.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les membres, WIGs, et données associées seront supprimés définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
