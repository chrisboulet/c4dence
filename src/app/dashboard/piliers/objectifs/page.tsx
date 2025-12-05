'use client'

import { PillarsScoreboard } from "@/components/dashboard/piliers/PillarsScoreboard"
import { ObjectiveStatus } from "@prisma/client"

// Mock data
const MOCK_OBJECTIVES = [
    {
        id: '1',
        name: 'Augmenter le CA annuel',
        description: 'Objectif de croissance',
        status: 'ON_TRACK' as ObjectiveStatus,
        targetValue: 3200000,
        currentValue: 2750000,
        startValue: 2500000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        unit: '$',
        organizationId: 'org-1',
        ownerId: 'user-1',
        owner: { fullName: 'Marie Tremblay', avatarUrl: null },
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        archivedAt: null,
        leadMeasures: [
            {
                id: 'lm-1',
                name: 'Appels de prospection',
                description: 'Appels sortants',
                targetPerWeek: 50,
                unit: 'appels',
                sortOrder: 0,
                objectiveId: '1',
                assignedToId: 'user-2',
                assignedTo: { fullName: 'Paul Smith', avatarUrl: null },
                currentWeekValue: 48,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    },
    {
        id: '2',
        name: 'Réduire le temps de livraison',
        description: 'Optimisation logistique',
        status: 'AT_RISK' as ObjectiveStatus,
        targetValue: 24,
        currentValue: 48,
        startValue: 96,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        unit: 'h',
        organizationId: 'org-1',
        ownerId: 'user-3',
        owner: { fullName: 'Jean Roy', avatarUrl: null },
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        archivedAt: null,
        leadMeasures: []
    }
]

export default function PillarsPage() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Les 4 Piliers</h1>
                <p className="text-muted-foreground">
                    Exécution stratégique et objectifs prioritaires.
                </p>
            </div>

            <PillarsScoreboard objectives={MOCK_OBJECTIVES} />
        </div>
    )
}
