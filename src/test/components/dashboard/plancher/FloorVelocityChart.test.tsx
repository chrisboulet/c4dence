import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FloorVelocityChart } from '@/components/dashboard/plancher/FloorVelocityChart'

// Mock Tremor components
vi.mock('@tremor/react', () => ({
    AreaChart: () => <div data-testid="area-chart">AreaChart</div>,
    Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Title: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('FloorVelocityChart', () => {
    it('renders the chart', () => {
        render(<FloorVelocityChart data={[]} />)
        expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
})
