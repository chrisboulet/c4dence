'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/components/providers/organization-provider'
import { ArrowLeft, Building2, Users, Bell, Palette, Info } from 'lucide-react'

export default function SettingsPage() {
  const { currentOrg, isAdmin } = useOrganization()

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les paramètres de votre compte et de l'organisation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-purple" />
              Organisation
            </CardTitle>
            <CardDescription>
              Paramètres de l'organisation actuelle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Organisation active</p>
              <p className="font-semibold">{currentOrg?.organization.name || '-'}</p>
            </div>

            {isAdmin && (
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/members">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les membres
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-cyan" />
              Notifications
            </CardTitle>
            <CardDescription>
              Préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">Bientôt disponible</p>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-brand-gold" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">Bientôt disponible</p>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-brand-lime" />
              À propos
            </CardTitle>
            <CardDescription>
              Informations sur l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Méthodologie</span>
              <span>Méthode C4DENCE</span>
            </div>
            <div className="pt-4 text-center text-xs text-muted-foreground">
              Propulsé par{' '}
              <span className="text-brand-gold font-medium">Boulet Stratégies TI</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
