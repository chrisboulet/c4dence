import { prisma } from "@/lib/prisma"
import { getCurrentWeekStartDate } from "@/lib/week"

export async function getTimeAllocation(organizationId: string) {
    const weekStartDate = getCurrentWeekStartDate()

    const allocation = await prisma.timeAllocation.findUnique({
        where: {
            organizationId_weekStartDate: {
                organizationId,
                weekStartDate,
            },
        },
    })

    if (!allocation) {
        return {
            floorHours: 0,
            pillarsHours: 0,
            totalHours: 0,
            pillarsPercent: 0,
        }
    }

    return allocation
}
