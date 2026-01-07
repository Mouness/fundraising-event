import { Link } from 'react-router-dom';
import { Calendar, Target, Users, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import { Button } from '@core/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/ui/card';
import type { EventResponseDto } from '@fundraising/types';

interface EventCardProps {
    event: EventResponseDto;
    variant?: 'default' | 'compact';
}

export const EventCard = ({ event, variant = 'default' }: EventCardProps) => {
    const { t } = useTranslation('common');
    const { formatCurrency } = useCurrencyFormatter();

    const status = event.status?.toUpperCase() || 'DRAFT';
    const raised = event.raised || 0;
    const goal = event.goalAmount || 1; // Avoid division by zero
    const progress = Math.min(100, Math.round((raised / goal) * 100));

    return (
        <Card className="flex flex-col hover:shadow-md transition-shadow h-full" style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 overflow-hidden">
                        <CardTitle className="line-clamp-1 text-lg" style={{ color: 'var(--admin-card-text)' }}>{event.name}</CardTitle>
                        {variant !== 'compact' && (
                            <CardDescription>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                                </span>
                            </CardDescription>
                        )}
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0"
                        style={{
                            backgroundColor: status === 'ACTIVE' ? 'var(--global-success-bg)' : 'var(--muted)',
                            color: status === 'ACTIVE' ? 'var(--global-success-color)' : 'var(--muted-foreground)'
                        }}>
                        {t(`admin_events.status.${status.toLowerCase()}`, status)}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className={`grid ${variant === 'compact' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Target className="h-3 w-3" /> {t('admin_events.goal', 'Goal')}
                        </span>
                        <div className="text-sm font-medium" style={{ color: 'var(--admin-card-text)' }}>
                            {formatCurrency(raised)} / {formatCurrency(event.goalAmount)}
                        </div>
                    </div>
                    {variant !== 'compact' && (
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" /> {t('admin_events.donors', 'Donors')}
                            </span>
                            <div className="text-sm font-semibold" style={{ color: 'var(--admin-card-text)' }}>
                                {event.donorCount || 0}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t('admin_events.progress', 'Progress')}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant="outline" style={{ borderColor: 'var(--admin-border-color)', color: 'var(--admin-card-text)' }}>
                    <Link to={`/admin/events/${event.slug}`}>
                        {t('admin_events.manage_event', 'Manage Event')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
