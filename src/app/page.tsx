import { redirect } from 'next/navigation'

// Page racine — redirige vers le dashboard ou login selon l'auth
// Pour l'instant, simple placeholder pendant le setup
export default function HomePage() {
  // TODO: Vérifier l'auth et rediriger
  // redirect('/dashboard') ou redirect('/login')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          C4DENCE
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Exécution Stratégique 4DX
        </p>
        <div className="flex gap-4 justify-center">
          <div className="px-4 py-2 rounded-lg bg-status-on-track text-white">
            ON TRACK
          </div>
          <div className="px-4 py-2 rounded-lg bg-status-at-risk text-white">
            AT RISK
          </div>
          <div className="px-4 py-2 rounded-lg bg-status-off-track text-white">
            OFF TRACK
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Setup Sprint 0 en cours...
        </p>
      </div>
    </main>
  )
}
