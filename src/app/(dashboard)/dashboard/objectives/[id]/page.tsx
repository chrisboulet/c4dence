import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { ObjectiveDetail } from '@/components/objective/objective-detail'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ObjectivePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const objective = await prisma.objective.findUnique({
    where: { id },
    include: {
      leadMeasures: {
        include: {
          weeklyMeasures: {
            orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
            take: 12,
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!objective) {
    notFound()
  }

  // Vérifier l'accès
  const membership = await prisma.membership.findFirst({
    where: {
      profileId: user.id,
      organizationId: objective.organizationId,
    },
  })

  if (!membership) {
    notFound()
  }

  return <ObjectiveDetail objective={objective} />
}
