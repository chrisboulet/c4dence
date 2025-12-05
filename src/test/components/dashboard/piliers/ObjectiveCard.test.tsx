import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ObjectiveCard } from '@/components/dashboard/piliers/ObjectiveCard'
import { ObjectiveStatus } from '@prisma/client'

// Mock data
const mockObjective = {
    id: '1',
    name: 'Augmenter le CA',
    description: 'Objectif annuel',
    startValue: 0,
    targetValue: 1000000,
    currentValue: 500000,
    unit: '$',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    status: 'ON_TRACK' as ObjectiveStatus,
    owner: {
        fullName: 'Jean Dupont',
        avatarUrl: null
    },
    organizationId: 'org-1',
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false,
    archivedAt: null
}

describe('ObjectiveCard', () => {
    it('renders the objective name and owner', () => {
        render(<ObjectiveCard objective={mockObjective} />)
        expect(screen.getByText('Augmenter le CA')).toBeInTheDocument()
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('displays the correct progress', () => {
        render(<ObjectiveCard objective={mockObjective} />)
        // 500k / 1m = 50%
        expect(screen.getByText('50%')).toBeInTheDocument()
        // Values are in separate spans, check for them individually
        expect(screen.getByText(/500,000/)).toBeInTheDocument()
        expect(screen.getByText(/1,000,000/)).toBeInTheDocument()
    })

    it('shows the correct status icon/text', () => {
        render(<ObjectiveCard objective={mockObjective} />)
        expect(screen.getByText('ON_TRACK')).toBeInTheDocument()
    })

    it('calculates progress correctly', () => {
        const customObjective = { ...mockObjective, currentValue: 750000 }
        render(<ObjectiveCard objective={customObjective} />)
        expect(screen.getByText('75%')).toBeInTheDocument()
    })
})
