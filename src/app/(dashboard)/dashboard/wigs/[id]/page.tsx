import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { WigDetail } from '@/components/wig/wig-detail'

type Props = {
  params: Promise<{ id: string }>
}

export default async function WigPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const wig = await prisma.wig.findUnique({
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

  if (!wig) {
    notFound()
  }

  // Vérifier l'accès
  const membership = await prisma.membership.findFirst({
    where: {
      profileId: user.id,
      organizationId: wig.organizationId,
    },
  })

  if (!membership) {
    notFound()
  }

  return <WigDetail wig={wig} />
}
