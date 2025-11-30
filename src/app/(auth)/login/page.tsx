'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-brand-purple/10" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-purple-cyan mb-4 glow-purple">
            <span className="text-2xl font-bold text-white">C4</span>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">C4DENCE</h1>
          <p className="text-muted-foreground">
            Exécution stratégique 4DX
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 glow-purple">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Bienvenue</h2>
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour accéder à vos objectifs stratégiques
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base gradient-purple-cyan hover:opacity-90 transition-opacity"
            size="lg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-muted-foreground">
          Propulsé par{' '}
          <span className="text-brand-gold font-medium">Boulet Stratégies TI</span>
        </p>
      </div>
    </main>
  )
}
