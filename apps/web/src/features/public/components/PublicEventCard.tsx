import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/ui/card'
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter'
import type { EventResponseDto } from '@fundraising/types'

interface PublicEventCardProps {
    event: EventResponseDto
    index: number
}

export const PublicEventCard = ({ event, index }: PublicEventCardProps) => {
    const { t } = useTranslation('common')
    const { formatCurrency } = useCurrencyFormatter()

    const raised = event.raised || 0
    const goal = event.goalAmount || 1
    const progress = Math.min(100, Math.round((raised / goal) * 100))

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link to={`/${event.slug || event.id}`} className="group block h-full">
                <Card
                    className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative group-hover:-translate-y-2"
                    style={{
                        backgroundColor:
                            'hsl(var(--landing-card-glass-bg) / var(--landing-card-glass-alpha))',
                        borderColor:
                            'hsl(var(--landing-card-glass-border) / var(--landing-card-glass-border-alpha))',
                    }}
                >
                    {/* Glow Effect on Hover */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            background:
                                'linear-gradient(to bottom right, hsl(var(--landing-hero-gradient-primary) / 0.1), transparent)',
                        }}
                    />

                    <CardHeader className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    event.status === 'active' || event.status === 'ACTIVE'
                                        ? 'bg-green-600 text-white dark:bg-green-500'
                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                            >
                                {event.status
                                    ? t(
                                          `admin_events.status.${event.status.toLowerCase()}`,
                                          event.status,
                                      )
                                    : 'DRAFT'}
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                            {event.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-2 text-base">
                            <Calendar className="h-4 w-4" />
                            {event.date
                                ? new Date(event.date).toLocaleDateString(undefined, {
                                      dateStyle: 'long',
                                  })
                                : t('root_landing.event_card.upcoming', 'Upcoming Event')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 relative z-10 pb-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                                        {t('root_landing.event_card.raised', 'Raised')}
                                    </span>
                                    <span className="text-2xl font-bold text-foreground">
                                        {formatCurrency(raised)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-primary">
                                        {progress}%
                                    </span>
                                </div>
                            </div>

                            {/* Custom Progress Bar */}
                            <div className="h-3 w-full bg-secondary/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-primary to-primary/80 relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </motion.div>
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                    {t('root_landing.event_card.goal_of', {
                                        amount: formatCurrency(event.goalAmount),
                                        defaultValue: `of ${formatCurrency(event.goalAmount)} goal`,
                                    })}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}
