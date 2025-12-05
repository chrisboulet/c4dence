import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OrganizationSettingsForm } from '@/components/organization/OrganizationSettingsForm'
import { Organization } from '@prisma/client'

// Mock server action
const updateOrganization = vi.fn()

vi.mock('@/app/actions/organization/update-settings', () => ({
    updateSettings: (...args: any[]) => updateOrganization(...args)
}))

describe('OrganizationSettingsForm', () => {
    const mockOrg = {
        id: 'org-1',
        name: 'Acme Inc',
        slug: 'acme-inc',
        syncDay: 'MONDAY',
        syncTime: '09:00',
        isActive: true
    } as Organization

    it('renders current values', () => {
        render(<OrganizationSettingsForm organization={mockOrg} />)

        expect(screen.getByDisplayValue('Acme Inc')).toBeInTheDocument()
    })

    it('updates name on submit', async () => {
        updateOrganization.mockResolvedValue({ success: true })

        render(<OrganizationSettingsForm organization={mockOrg} />)

        const input = screen.getByLabelText(/Nom de l'organisation/i)
        fireEvent.change(input, { target: { value: 'Acme Corp' } })

        const submitBtn = screen.getByText(/Enregistrer/i)
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(updateOrganization).toHaveBeenCalledWith({
                organizationId: 'org-1',
                name: 'Acme Corp'
            })
        })
    })
})
