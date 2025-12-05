import { Urgency, BusinessImpact, TaskCategory } from '@prisma/client'

export function categorizeTask(urgency: Urgency, impact: BusinessImpact): TaskCategory {
    if (urgency === 'HIGH' && impact === 'HIGH') {
        return 'IMMEDIATE'
    }

    if (urgency === 'LOW' && impact === 'HIGH') {
        return 'PLAN'
    }

    if (urgency === 'HIGH' && impact === 'LOW') {
        return 'DELEGATE'
    }

    return 'BACKLOG'
}
