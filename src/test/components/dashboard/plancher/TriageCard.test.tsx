import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TriageCard } from '@/components/dashboard/plancher/TriageCard'

describe('TriageCard', () => {
    const mockTask = {
        id: '1',
        title: 'Test Task',
        description: 'Description',
        status: 'TO_TRIAGE',
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    it('renders task details', () => {
        render(<TriageCard task={mockTask as any} onTriage={vi.fn()} />)
        expect(screen.getByText('Test Task')).toBeInTheDocument()
    })

    it('calculates category based on selection', () => {
        render(<TriageCard task={mockTask as any} onTriage={vi.fn()} />)

        // Default might be LOW/LOW -> BACKLOG
        // Let's click High Urgency
        const urgencyButton = screen.getByLabelText('High Urgency')
        fireEvent.click(urgencyButton)

        // Now High/Low -> DELEGATE
        expect(screen.getByText('DELEGATE')).toBeInTheDocument()

        // Click High Impact
        const impactButton = screen.getByLabelText('High Impact')
        fireEvent.click(impactButton)

        // Now High/High -> IMMEDIATE
        expect(screen.getByText('IMMEDIATE')).toBeInTheDocument()
    })
})
