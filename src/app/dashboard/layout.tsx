
import { Header } from '@/components/layout/header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header userEmail={user.email} />
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    )
}
