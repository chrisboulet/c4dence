export interface TimeAllocationData {
    floorHours: number
    pillarsHours: number
}

export function calculateStrategicRatio(data: TimeAllocationData): number {
    const totalHours = data.floorHours + data.pillarsHours

    if (totalHours === 0) {
        return 0
    }

    const ratio = (data.pillarsHours / totalHours) * 100
    return Math.round(ratio * 10) / 10
}
