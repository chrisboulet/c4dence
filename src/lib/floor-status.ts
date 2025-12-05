export type FloorStatus = 'CONTROLLED' | 'OVERFLOWING'

export function calculateFloorStatus(wip: number, limit: number): FloorStatus {
    if (wip > limit) {
        return 'OVERFLOWING'
    }
    return 'CONTROLLED'
}
