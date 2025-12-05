import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KanbanBoard } from '@/components/dashboard/plancher/KanbanBoard'

describe('KanbanBoard', () => {
    const mockTasks = [
        { id: '1', title: 'Task 1', status: 'TO_TRIAGE', organizationId: 'org-1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Task 2', status: 'TODO', organizationId: 'org-1', createdAt: new Date(), updatedAt: new Date() },
    ]

    it('renders all columns', () => {
        render(<KanbanBoard tasks={mockTasks as any} />)
        expect(screen.getByText('À TRIER')).toBeInTheDocument()
        expect(screen.getByText('À FAIRE')).toBeInTheDocument()
        expect(screen.getByText('EN COURS')).toBeInTheDocument()
        expect(screen.getByText('TERMINÉ')).toBeInTheDocument()
    })

    it('renders tasks in correct columns', () => {
        render(<KanbanBoard tasks={mockTasks as any} />)
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
})
