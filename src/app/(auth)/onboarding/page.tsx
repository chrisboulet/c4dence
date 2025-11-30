'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createOrganization } from '@/app/actions/organization'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Le nom de l'organisation est requis")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createOrganization({ name: name.trim() })

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-brand-purple/5">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <Image
            src="/logo_icon_wordmark_dark.png"
            alt="C4DENCE"
            width={160}
            height={42}
            className="mx-auto mb-2"
            priority
          />
          <CardTitle className="text-2xl">Bienvenue sur C4DENCE</CardTitle>
          <CardDescription>
            Créez votre première organisation pour commencer à suivre vos objectifs 4DX.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'organisation</Label>
              <Input
                id="name"
                placeholder="Ex: Mon Entreprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Vous pourrez inviter des membres et en créer d'autres plus tard.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                'Création en cours...'
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Créer mon espace
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
