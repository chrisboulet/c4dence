'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAllLeadMeasures } from '@/app/actions/lead-measure'
import { getObjectives } from '@/app/actions/objective'
import { getOrganizationMembers } from '@/app/actions/organization'
import { useOrganization } from '@/components/providers/organization-provider'
import { IndicatorList } from '@/components/indicator/indicator-list'
import { Loader2 } from 'lucide-react'
import { ObjectiveSummary } from '@/types'
import { LeadMeasure } from '@prisma/client'

type IndicatorWithRelations = LeadMeasure & {
    objective: { name: string },
    assignedTo: { fullName: string | null; avatarUrl: string | null } | null
}

export default function IndicateursPage() {
    const { currentOrg, isLoading: isOrgLoading } = useOrganization()
    const [indicators, setIndicators] = useState<IndicatorWithRelations[]>([])
    const [objectives, setObjectives] = useState<ObjectiveSummary[]>([])
    const [members, setMembers] = useState<Array<{ id: string; profile: { id: string; fullName: string | null; avatarUrl: string | null } }>>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        if (!currentOrg) return
        setIsLoading(true)

        try {
            const [indicatorsRes, objectivesRes, membersRes] = await Promise.all([
                getAllLeadMeasures(currentOrg.organizationId),
                getObjectives(currentOrg.organizationId),
                getOrganizationMembers(currentOrg.organizationId)
            ])

            if (indicatorsRes.success) setIndicators(indicatorsRes.data)
            if (objectivesRes.success) setObjectives(objectivesRes.data)
            if (membersRes.success) setMembers(membersRes.data)

        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [currentOrg])

    useEffect(() => {
        if (!isOrgLoading && currentOrg) {
            fetchData()
        }
    }, [isOrgLoading, currentOrg, fetchData])

    if (isOrgLoading || (isLoading && !indicators.length)) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <IndicatorList
                indicators={indicators}
                objectives={objectives}
                members={members}
                onRefresh={fetchData}
            />
        </div>
    )
}
