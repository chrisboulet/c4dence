import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PillarsScoreboard } from '@/components/dashboard/piliers/PillarsScoreboard'
import { ObjectiveStatus } from '@prisma/client'

// Mock data
const mockObjectives = [
    {
        id: '1',
        name: 'Objectif 1',
        status: 'ON_TRACK' as ObjectiveStatus,
        targetValue: 100,
        currentValue: 90,
        startValue: 0,
        startDate: new Date(),
        endDate: new Date(),
        unit: '%',
        owner: { fullName: 'Owner 1', avatarUrl: null },
        leadMeasures: []
    },
    {
        id: '2',
        name: 'Objectif 2',
        status: 'AT_RISK' as ObjectiveStatus,
        targetValue: 100,
        currentValue: 50,
        startValue: 0,
        startDate: new Date(),
        endDate: new Date(),
        unit: '%',
        owner: { fullName: 'Owner 2', avatarUrl: null },
        leadMeasures: []
    }
]

describe('PillarsScoreboard', () => {
    it('renders the global status', () => {
        render(<PillarsScoreboard objectives={mockObjectives} />)
        // Since one is AT_RISK, global status should be DANGER
        expect(screen.getByText('DANGER')).toBeInTheDocument()
    })

    it('renders all objectives', () => {
        render(<PillarsScoreboard objectives={mockObjectives} />)
        expect(screen.getByText('Objectif 1')).toBeInTheDocument()
        expect(screen.getByText('Objectif 2')).toBeInTheDocument()
    })

    it('shows VICTOIRE EN VUE when all are ON_TRACK', () => {
        const goodObjectives = [mockObjectives[0]]
        render(<PillarsScoreboard objectives={goodObjectives} />)
        expect(screen.getByText('VICTOIRE EN VUE')).toBeInTheDocument()
    })
})
