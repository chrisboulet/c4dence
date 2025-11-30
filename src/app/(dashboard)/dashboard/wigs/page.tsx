import { WigsPage } from '@/components/wig/wigs-page'

export default function WigsRoute() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground mb-1">Discipline 1</p>
          <h1 className="text-3xl font-bold">
            Vos <span className="text-gradient">WIGs</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Focus sur les objectifs vitalement importants
          </p>
        </div>
      </div>

      {/* WIGs Page Component */}
      <WigsPage />
    </div>
  )
}
