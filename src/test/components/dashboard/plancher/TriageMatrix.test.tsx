import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TriageMatrix } from '@/components/dashboard/plancher/TriageMatrix'

describe('TriageMatrix', () => {
    it('renders the 4 quadrants', () => {
        render(<TriageMatrix />)
        expect(screen.getByText('IMMÉDIAT')).toBeInTheDocument()
        expect(screen.getByText('PLANIFIER')).toBeInTheDocument()
        expect(screen.getByText('DÉLÉGUER')).toBeInTheDocument()
        expect(screen.getByText('BACKLOG')).toBeInTheDocument()
    })

    it('highlights the active category', () => {
        render(<TriageMatrix activeCategory="IMMEDIATE" />)
        const immediateCell = screen.getByTestId('matrix-immediate')
        expect(immediateCell).toHaveAttribute('data-active', 'true')

        const planCell = screen.getByTestId('matrix-plan')
        expect(planCell).toHaveAttribute('data-active', 'false')
    })
})
