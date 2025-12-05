import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FloorStatusCard } from '@/components/dashboard/orchestration/FloorStatusCard'

describe('FloorStatusCard', () => {
    it('renders CONTROLLED status correctly', () => {
        render(<FloorStatusCard status="CONTROLLED" />)
        expect(screen.getByText('SOUS CONTRÔLE')).toBeInTheDocument()
        expect(screen.getByText('🟢')).toBeInTheDocument()
    })

    it('renders OVERFLOWING status correctly', () => {
        render(<FloorStatusCard status="OVERFLOWING" />)
        expect(screen.getByText('DÉBORDEMENT')).toBeInTheDocument()
        expect(screen.getByText('🔴')).toBeInTheDocument()
    })
})
