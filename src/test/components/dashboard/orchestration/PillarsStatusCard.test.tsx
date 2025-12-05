import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PillarsStatusCard } from '@/components/dashboard/orchestration/PillarsStatusCard'

describe('PillarsStatusCard', () => {
    it('renders ON_TRACK status correctly', () => {
        render(<PillarsStatusCard status="ON_TRACK" />)
        expect(screen.getByText('VICTOIRE EN VUE')).toBeInTheDocument()
        expect(screen.getByText('🏆')).toBeInTheDocument()
    })

    it('renders AT_RISK status correctly', () => {
        render(<PillarsStatusCard status="AT_RISK" />)
        expect(screen.getByText('DANGER')).toBeInTheDocument()
        expect(screen.getByText('⚠️')).toBeInTheDocument()
    })
})
