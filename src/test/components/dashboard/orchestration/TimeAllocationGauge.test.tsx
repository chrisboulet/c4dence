import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TimeAllocationGauge } from '@/components/dashboard/orchestration/TimeAllocationGauge'

describe('TimeAllocationGauge', () => {
    it('renders correct percentages', () => {
        render(<TimeAllocationGauge floorHours={36} pillarsHours={4} />)
        // 36 + 4 = 40h total
        // Floor = 90%, Pillars = 10%
        expect(screen.getByText(/90%/)).toBeInTheDocument()
        expect(screen.getByText(/10%/)).toBeInTheDocument()
    })

    it('shows warning when pillars < 10%', () => {
        render(<TimeAllocationGauge floorHours={38} pillarsHours={2} />)
        // 38 + 2 = 40h total
        // Pillars = 5% (< 10%)
        expect(screen.getByText(/Attention/)).toBeInTheDocument()
    })
})
