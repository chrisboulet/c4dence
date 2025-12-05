import { describe, it, expect } from 'vitest'
import { calculateFloorStatus } from '@/lib/floor-status'

describe('calculateFloorStatus', () => {
    it('returns CONTROLLED when WIP is below limit', () => {
        const status = calculateFloorStatus(3, 5)
        expect(status).toBe('CONTROLLED')
    })

    it('returns CONTROLLED when WIP equals limit', () => {
        const status = calculateFloorStatus(5, 5)
        expect(status).toBe('CONTROLLED')
    })

    it('returns OVERFLOWING when WIP exceeds limit', () => {
        const status = calculateFloorStatus(6, 5)
        expect(status).toBe('OVERFLOWING')
    })

    it('handles zero limit (always overflowing if tasks > 0)', () => {
        const status = calculateFloorStatus(1, 0)
        expect(status).toBe('OVERFLOWING')
    })
})
