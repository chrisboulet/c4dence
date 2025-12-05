import { describe, it, expect } from 'vitest'
import { categorizeTask } from '@/lib/triage'

describe('categorizeTask', () => {
    it('returns IMMEDIATE for High Urgency + High Impact', () => {
        const result = categorizeTask('HIGH', 'HIGH')
        expect(result).toBe('IMMEDIATE')
    })

    it('returns PLAN for Low Urgency + High Impact', () => {
        const result = categorizeTask('LOW', 'HIGH')
        expect(result).toBe('PLAN')
    })

    it('returns DELEGATE for High Urgency + Low Impact', () => {
        const result = categorizeTask('HIGH', 'LOW')
        expect(result).toBe('DELEGATE')
    })

    it('returns BACKLOG for Low Urgency + Low Impact', () => {
        const result = categorizeTask('LOW', 'LOW')
        expect(result).toBe('BACKLOG')
    })
})
