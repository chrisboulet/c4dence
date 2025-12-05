import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LeadMeasureCard } from '@/components/dashboard/piliers/LeadMeasureCard'

// Mock data
const mockLeadMeasure = {
    id: '1',
    name: 'Appels de prospection',
    description: 'Appels sortants vers prospects',
    targetPerWeek: 50,
    unit: 'appels',
    sortOrder: 0,
    objectiveId: 'obj-1',
    assignedToId: 'user-1',
    assignedTo: {
        fullName: 'Marie Tremblay',
        avatarUrl: null
    },
    currentWeekValue: 45, // Mocked prop for current week's value
    createdAt: new Date(),
    updatedAt: new Date()
}

describe('LeadMeasureCard', () => {
    it('renders the measure name and target', () => {
        render(<LeadMeasureCard measure={mockLeadMeasure} />)
        expect(screen.getByText('Appels de prospection')).toBeInTheDocument()
        expect(screen.getByText(/50/)).toBeInTheDocument()
        expect(screen.getAllByText(/appels/)[0]).toBeInTheDocument()
    })

    it('displays the current value', () => {
        render(<LeadMeasureCard measure={mockLeadMeasure} />)
        expect(screen.getByDisplayValue('45')).toBeInTheDocument()
    })

    it('calls onUpdate when value changes', () => {
        const handleUpdate = vi.fn()
        render(<LeadMeasureCard measure={mockLeadMeasure} onUpdate={handleUpdate} />)

        const input = screen.getByDisplayValue('45')
        fireEvent.change(input, { target: { value: '50' } })

        // Depending on implementation, might need to blur or submit
        fireEvent.blur(input)

        expect(handleUpdate).toHaveBeenCalledWith('1', 50)
    })

    it('shows the assignee', () => {
        render(<LeadMeasureCard measure={mockLeadMeasure} />)
        expect(screen.getByText('Marie Tremblay')).toBeInTheDocument()
    })
})
