import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MembersList, MemberWithProfile } from '@/components/organization/MembersList'

// Mock icons
vi.mock('lucide-react', () => ({
    User: () => <div data-testid="icon-user" />,
    MoreHorizontal: () => <div data-testid="icon-more" />,
    Shield: () => <div data-testid="icon-shield" />,
    UserMinus: () => <div data-testid="icon-user-minus" />
}))

// Mock UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <button>{children}</button>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => (
        <div onClick={onClick} role="menuitem">
            {children}
        </div>
    ),
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>
}))

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children }: any) => <div>{children}</div>,
    AvatarFallback: ({ children }: any) => <div>{children}</div>,
    AvatarImage: () => <img alt="avatar" />
}))

describe('MembersList', () => {
    const mockMembers: MemberWithProfile[] = [
        {
            id: 'm1',
            role: 'OWNER',
            profile: {
                id: 'p1',
                email: 'alice@example.com',
                fullName: 'Alice Owner',
                avatarUrl: null
            }
        },
        {
            id: 'm2',
            role: 'ADMIN',
            profile: {
                id: 'p2',
                email: 'bob@example.com',
                fullName: 'Bob Admin',
                avatarUrl: null
            }
        },
        {
            id: 'm3',
            role: 'MEMBER',
            profile: {
                id: 'p3',
                email: 'charlie@example.com',
                fullName: 'Charlie Member',
                avatarUrl: null
            }
        }
    ]

    it('renders all members', () => {
        render(<MembersList members={mockMembers} currentUserId="p1" />)

        expect(screen.getByText('Alice Owner')).toBeInTheDocument()
        expect(screen.getByText('Bob Admin')).toBeInTheDocument()
        expect(screen.getByText('Charlie Member')).toBeInTheDocument()
    })

    it('displays correct roles', () => {
        render(<MembersList members={mockMembers} currentUserId="p1" />)

        expect(screen.getByText('Propriétaire')).toBeInTheDocument()
        expect(screen.getByText('Administrateur')).toBeInTheDocument()
        expect(screen.getByText('Membre')).toBeInTheDocument()
    })

    it('allows changing role if current user is admin/owner', () => {
        const onRoleChange = vi.fn()
        render(
            <MembersList
                members={mockMembers}
                currentUserId="p1"
                onUpdateRole={onRoleChange}
            />
        )

        // Find "Promouvoir Admin" option (mocked DropdownMenu renders content directly)
        const adminOption = screen.getAllByText('Promouvoir Admin')[0]
        fireEvent.click(adminOption)

        expect(onRoleChange).toHaveBeenCalled()
    })
})
