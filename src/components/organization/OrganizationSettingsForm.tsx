'use client'

import { useState } from 'react'
import { Organization } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateSettings } from '@/app/actions/organization/update-settings'
import { toast } from "sonner"

interface OrganizationSettingsFormProps {
    organization: Organization
}

export function OrganizationSettingsForm({ organization }: OrganizationSettingsFormProps) {
    const [name, setName] = useState(organization.name)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateSettings({
                organizationId: organization.id,
                name
            })

            if (result.success) {
                toast.success("Paramètres mis à jour")
            } else {
                toast.error(result.error)
            }
        } catch {
            toast.error("Erreur inattendue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Général</CardTitle>
                    <CardDescription>
                        Modifier les informations de base de votre organisation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'organisation</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
