
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding demo data (JS)...')

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

    // 3. Create Time Allocation (Orchestration)
    try {
        await prisma.timeAllocation.create({
            data: {
                organizationId: org.id,
                weekNumber: 49,
                year: 2025,
                pillarsHours: 12,
                floorHours: 28,
                totalHours: 40
            }
        })
    } catch (e) {
        console.log('TimeAllocation already exists or error:', e.message)
    }

    // 4. Create Objectives
    await prisma.objective.createMany({
        data: [
            {
                organizationId: org.id,
                title: 'Lancer C4DENCE v3.1',
                description: 'Objectif critique pour le Q4',
                status: 'ON_TRACK',
                progress: 85,
                ownerId: profile.id,
                dueDate: new Date('2025-12-31')
            },
            {
                organizationId: org.id,
                title: 'Recruter 3 Développeurs',
                description: 'Scaling équipe',
                status: 'AT_RISK',
                progress: 40,
                ownerId: profile.id,
                dueDate: new Date('2026-01-30')
            }
        ]
    })

    // 5. Create Tasks
    await prisma.task.createMany({
        data: [
            {
                organizationId: org.id,
                title: 'Fixer le bug de login',
                status: 'DOING',
                priority: 'HIGH',
                category: 'Q1_NECESSITY',
                assigneeId: profile.id
            },
            {
                organizationId: org.id,
                title: 'Rédiger la documentation API',
                status: 'TODO',
                priority: 'MEDIUM',
                category: 'Q2_QUALITY',
                assigneeId: profile.id
            },
            {
                organizationId: org.id,
                title: 'Nettoyer le channel Slack',
                status: 'DONE',
                priority: 'LOW',
                category: 'Q4_WASTE',
                assigneeId: profile.id
            },
            {
                organizationId: org.id,
                title: 'Brainstorming IA',
                status: 'TODO',
                priority: 'LOW',
                category: 'Q3_DECEPTION',
                assigneeId: profile.id
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
