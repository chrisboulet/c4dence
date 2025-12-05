'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrganization } from '@/app/actions/organization/create-organization'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        const result = await createOrganization(formData)

        if (result.error) {
            toast.error(result.error)
            setIsLoading(false)
        } else {
            toast.success('Organisation créée !')
            router.push('/dashboard')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Créer votre organisation</CardTitle>
                    <CardDescription>
                        Commencez par nommer votre espace de travail.
                    </CardDescription>
                </CardHeader>
                <form action={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom de l'organisation</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: Acme Inc."
                                required
                                minLength={3}
                                onChange={(e) => {
                                    // Auto-generate slug (simplified)
                                    const slugInput = document.getElementById('slug') as HTMLInputElement
                                    if (slugInput && !slugInput.dataset.modified) {
                                        slugInput.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Identifiant unique (URL)</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="acme-inc"
                                required
                                onChange={(e) => {
                                    e.target.dataset.modified = "true"
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Sera utilisé pour l'URL de votre espace.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'Création...' : 'Commencer'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
