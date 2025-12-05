import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TimeAllocationGauge } from '@/components/dashboard/orchestration/TimeAllocationGauge'

describe('TimeAllocationGauge', () => {
    it('renders the correct percentages', () => {
        render(<TimeAllocationGauge floorHours={36} pillarsHours={4} />)
        // 4 / 40 = 10%
        expect(screen.getByText(/10%/)).toBeInTheDocument()
        // Floor hours should be displayed in text
        expect(screen.getByText(/36h/)).toBeInTheDocument()
    })

    it('shows warning when under 10%', () => {
        render(<TimeAllocationGauge floorHours={38} pillarsHours={2} />)
        // 2 / 40 = 5%
        expect(screen.getByText(/Attention/)).toBeInTheDocument()
        expect(screen.getByText(/5%/)).toBeInTheDocument()
    })
})
