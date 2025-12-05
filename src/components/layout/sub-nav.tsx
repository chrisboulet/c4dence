'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SubNavItem {
    name: string
    href: string
}

interface SubNavProps {
    items: SubNavItem[]
}

export function SubNav({ items }: SubNavProps) {
    const pathname = usePathname()

    return (
        <div className="border-b border-border/40 mb-8">
            <div className="flex h-10 items-center gap-6 relative">
                {items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex h-full items-center px-1 text-sm font-medium transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {item.name}
                            {isActive && (
                                <motion.div
                                    layoutId="subnav-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
