'use client'

import { useState, useEffect } from 'react'
import { Users, Building2, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { adminGetAllUsers } from '@/app/actions/admin'
import Link from 'next/link'

interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: Date
  organizations: { id: string; name: string; role: string }[]
}

const roleLabels = {
  OWNER: 'Propriétaire',
  ADMIN: 'Admin',
  MEMBER: 'Membre',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const result = await adminGetAllUsers()
      if (result.success) {
        setUsers(result.data)
      }
      setIsLoading(false)
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    user =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Utilisateurs</CardDescription>
            <CardTitle className="text-3xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avec organisation</CardDescription>
            <CardTitle className="text-3xl text-brand-cyan">
              {users.filter(u => u.organizations.length > 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sans organisation</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {users.filter(u => u.organizations.length === 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>Tous les utilisateurs inscrits sur la plateforme</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Aucun utilisateur trouvé</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {user.fullName?.[0] || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName || 'Sans nom'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {user.organizations.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        Aucune organisation
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2 justify-end max-w-md">
                        {user.organizations.map(org => (
                          <Link
                            key={org.id}
                            href={`/admin/organizations/${org.id}`}
                            className="flex items-center gap-1 text-sm bg-secondary px-2 py-1 rounded hover:bg-secondary/80 transition-colors"
                          >
                            <Building2 className="h-3 w-3" />
                            {org.name}
                            <Badge variant="outline" className="ml-1 text-xs">
                              {roleLabels[org.role as keyof typeof roleLabels]}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
