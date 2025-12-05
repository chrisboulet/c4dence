
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding demo data...')

    // 1. Create or get Profile
    const email = 'demo@c4dence.com'
    const profile = await prisma.profile.upsert({
        where: { email },
        update: {},
        create: {
            email,
            fullName: 'Demo User',
        }
    })

    // 2. Create Organization
    const orgSlug = 'demo-corp'
    const org = await prisma.organization.upsert({
        where: { slug: orgSlug },
        update: {},
        create: {
            name: 'C4DENCE Demo Corp',
            slug: orgSlug,
            memberships: {
                create: {
                    profileId: profile.id,
                    role: 'OWNER'
                }
            }
        }
    })

    console.log(`🏢 Organization created: ${org.name}`)

    // 3. Create Time Allocation
    try {
        const monday = new Date()
        monday.setTime(monday.getTime() - (monday.getDay() - 1) * 24 * 60 * 60 * 1000)
        monday.setHours(0, 0, 0, 0)

        await prisma.timeAllocation.upsert({
            where: {
                organizationId_weekStartDate: {
                    organizationId: org.id,
                    weekStartDate: monday
                }
            },
            update: {},
            create: {
                organizationId: org.id,
                weekStartDate: monday,
                floorHours: 28,
                pillarsHours: 12,
                totalHours: 40,
                pillarsPercent: 30,
                meetsMinimum: true
            }
        })
    } catch (e) {
        console.log('Error creating time allocation:', e)
    }

    // 4. Create Objectives
    const obj1 = await prisma.objective.create({
        data: {
            organizationId: org.id,
            name: 'Lancer C4DENCE v3.1',
            description: 'Objectif critique pour le Q4',
            status: 'ON_TRACK',
            startValue: 0,
            targetValue: 100,
            currentValue: 85,
            unit: '%',
            startDate: new Date('2025-10-01'),
            endDate: new Date('2025-12-31'),
            ownerId: profile.id
        }
    })

    const obj2 = await prisma.objective.create({
        data: {
            organizationId: org.id,
            name: 'Recruter 3 Développeurs',
            description: 'Scaling de l\'équipe technique',
            status: 'AT_RISK',
            startValue: 0,
            targetValue: 3,
            currentValue: 1,
            unit: 'devs',
            startDate: new Date('2025-10-01'),
            endDate: new Date('2026-01-30'),
            ownerId: profile.id
        }
    })

    // 5. Create Tasks
    await prisma.task.createMany({
        data: [
            {
                organizationId: org.id,
                title: 'Fixer le bug de login',
                status: 'IN_PROGRESS',
                urgency: 'HIGH',
                businessImpact: 'HIGH',
                category: 'IMMEDIATE',
                assignedToId: profile.id
            },
            {
                organizationId: org.id,
                title: 'Rédiger la documentation API',
                status: 'TODO',
                urgency: 'LOW',
                businessImpact: 'HIGH',
                category: 'PLAN',
                assignedToId: profile.id
            },
            {
                organizationId: org.id,
                title: 'Nettoyer le channel Slack',
                status: 'DONE',
                urgency: 'HIGH',
                businessImpact: 'LOW',
                category: 'DELEGATE',
                assignedToId: profile.id
            },
            {
                organizationId: org.id,
                title: 'Brainstorming IA',
                status: 'TODO',
                urgency: 'LOW',
                businessImpact: 'LOW',
                category: 'BACKLOG',
                assignedToId: profile.id
            }
        ]
    })

    console.log('✅ Demo data seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
