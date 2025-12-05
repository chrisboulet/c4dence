import { z } from 'zod'

/**
 * Schéma de base pour les inputs communs
 */
const dateSchema = z.union([
    z.date(),
    z.string().transform((str) => new Date(str)),
])

/**
 * Schémas pour les Objectifs
 */
export const createObjectiveSchema = z.object({
    organizationId: z.string().uuid().optional(), // Optionnel car peut être inféré
    name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
    description: z.string().max(1000, 'La description est trop longue').optional(),
    startValue: z.number({ message: 'La valeur de départ doit être un nombre' }),
    targetValue: z.number({ message: 'La valeur cible doit être un nombre' }),
    unit: z.string().max(20, "L'unité est trop longue"),
    startDate: dateSchema,
    endDate: dateSchema,
    ownerId: z.string().uuid().optional(),
})

export const updateObjectiveSchema = createObjectiveSchema
    .partial()
    .extend({
        id: z.string().uuid(),
        currentValue: z.number().optional(),
    })
// Pour l'update, organisationId n'est généralement pas modifiable directement via ce DTO, 
// mais on le garde accessible si nécessaire, ou on l'ignore dans l'action.

/**
 * Schémas pour les Indicateurs Prédictifs (Lead Measures)
 */
export const createLeadMeasureSchema = z.object({
    objectiveId: z.string().uuid(),
    name: z.string().min(1, 'Le nom est requis').max(100),
    description: z.string().max(500).optional(),
    targetPerWeek: z.number().min(0),
    unit: z.string().max(20),
    assignedToId: z.string().uuid().optional(),
})

/**
 * Schémas pour les Mesures Hebdomadaires
 */
export const recordWeeklyMeasureSchema = z.object({
    leadMeasureId: z.string().uuid(),
    year: z.number().int().min(2020).max(2100),
    weekNumber: z.number().int().min(1).max(53),
    value: z.number(),
    notes: z.string().max(500).optional(),
})

/**
 * Schémas pour les Engagements
 */
export const createEngagementSchema = z.object({
    organizationId: z.string().uuid().optional(),
    year: z.number().int().min(2020).max(2100),
    weekNumber: z.number().int().min(1).max(53),
    description: z.string().min(1, "L'engagement ne peut être vide").max(300),
})

/**
 * Schémas pour les Obstacles (Blockers)
 */
export const createBlockerSchema = z.object({
    objectiveId: z.string().uuid(),
    description: z.string().min(1).max(500),
})

export const updateBlockerSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(['OPEN', 'ESCALATED', 'RESOLVED']).optional(),
    escalatedTo: z.string().optional(),
    resolution: z.string().optional(),
})
