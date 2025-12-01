import { ObjectivesPage } from '@/components/objective/objectives-page'

export default function ObjectivesRoute() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground mb-1">Pilier 1</p>
          <h1 className="text-3xl font-bold">
            Vos <span className="text-gradient">Objectifs</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Focus sur les objectifs stratégiques
          </p>
        </div>
      </div>

      {/* Objectives Page Component */}
      <ObjectivesPage />
    </div>
  )
}
