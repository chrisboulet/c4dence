import { describe, it, expect } from 'vitest'
import { calculateStrategicRatio, TimeAllocationData } from '@/lib/time-allocation'

describe('calculateStrategicRatio', () => {
    it('calculates the correct percentage', () => {
        const data: TimeAllocationData = {
            floorHours: 36,
            pillarsHours: 4
        }
        // 4 / (36 + 4) = 4 / 40 = 10%
        expect(calculateStrategicRatio(data)).toBe(10)
    })

    it('handles zero total hours', () => {
        const data: TimeAllocationData = {
            floorHours: 0,
            pillarsHours: 0
        }
        expect(calculateStrategicRatio(data)).toBe(0)
    })

    it('handles zero pillars hours', () => {
        const data: TimeAllocationData = {
            floorHours: 40,
            pillarsHours: 0
        }
        expect(calculateStrategicRatio(data)).toBe(0)
    })

    it('rounds to one decimal place', () => {
        const data: TimeAllocationData = {
            floorHours: 35,
            pillarsHours: 4
        }
        // 4 / 39 = 10.256... -> 10.3
        expect(calculateStrategicRatio(data)).toBe(10.3)
    })
})
