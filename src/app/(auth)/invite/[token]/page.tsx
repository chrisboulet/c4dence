'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { acceptInvitation } from '@/app/actions/organization'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'accepting' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Petit délai pour l'UX
    const timer = setTimeout(() => setStatus('accepting'), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleAccept = async () => {
    setStatus('accepting')
    const result = await acceptInvitation(token)

    if (result.success) {
      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 2000)
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  useEffect(() => {
    if (status === 'accepting') {
      handleAccept()
    }
  }, [status])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-brand-purple/5">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 p-4 rounded-2xl w-fit ${
            status === 'success' ? 'bg-brand-cyan/20' :
            status === 'error' ? 'bg-destructive/20' :
            'bg-brand-purple/20'
          }`}>
            {status === 'success' ? (
              <CheckCircle2 className="h-8 w-8 text-brand-cyan" />
            ) : status === 'error' ? (
              <XCircle className="h-8 w-8 text-destructive" />
            ) : status === 'accepting' ? (
              <Loader2 className="h-8 w-8 text-brand-purple animate-spin" />
            ) : (
              <Mail className="h-8 w-8 text-brand-purple" />
            )}
          </div>

          <CardTitle className="text-2xl">
            {status === 'success' ? 'Invitation acceptée!' :
             status === 'error' ? 'Erreur' :
             'Acceptation de l\'invitation'}
          </CardTitle>

          <CardDescription>
            {status === 'success' ? (
              'Vous avez rejoint l\'organisation. Redirection vers le dashboard...'
            ) : status === 'error' ? (
              error || 'Une erreur est survenue'
            ) : (
              'Veuillez patienter...'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          {status === 'error' && (
            <div className="space-y-4 w-full">
              <Button asChild className="w-full">
                <Link href="/login">
                  Se connecter
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Assurez-vous d'être connecté avec l'email associé à l'invitation.
              </p>
            </div>
          )}

          {status === 'success' && (
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Aller au dashboard
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
