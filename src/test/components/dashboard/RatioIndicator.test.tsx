import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RatioIndicator } from '@/components/dashboard/RatioIndicator'

describe('RatioIndicator', () => {
    it('renders correctly with high ratio', () => {
        render(<RatioIndicator pillarsPercent={15} />)
        expect(screen.getByText(/15%/)).toBeInTheDocument()
        const indicator = screen.getByText(/15%/)
        expect(indicator.className).toContain('text-green')
    })

    it('renders correctly with low ratio', () => {
        render(<RatioIndicator pillarsPercent={5} />)
        expect(screen.getByText(/5%/)).toBeInTheDocument()
        const indicator = screen.getByText(/5%/)
        expect(indicator.className).toContain('text-red')
    })
})
