import { Plus, Trash2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useEvent } from '@features/events/context/EventContext';
import { api } from '@core/lib/api';
import { Button } from '@core/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@core/components/ui/card';


export const EventTeamPage = () => {
    const { t } = useTranslation('common');
    const { event } = useEvent();
    const queryClient = useQueryClient();

    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['event-staff', event?.id],
        queryFn: async () => {
            if (!event?.id) return [];
            const res = await api.get(`/events/${event.id}/staff`);
            return res.data;
        },
        enabled: !!event?.id,
    });

    const { data: globalStaff = [] } = useQuery({
        queryKey: ['global-staff'],
        queryFn: async () => {
            const res = await api.get('/staff');
            return res.data;
        },
    });

    const assignMutation = useMutation({
        mutationFn: async (staffId: string) => {
            if (!event?.id) throw new Error('No event ID');
            await api.post(`/events/${event.id}/staff/${staffId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-staff', event?.id] });
        },
        onError: (err: unknown) => {
            console.error('Failed to assign staff', err);
            toast.error(t('admin_team.error_assignment'));
        }
    });

    const unassignMutation = useMutation({
        mutationFn: async (staffId: string) => {
            if (!event?.id) throw new Error('No event ID');
            const res = await api.delete(`/events/${event.id}/staff/${staffId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-staff', event?.id] });
        },
        onError: (err: unknown) => {
            console.error('Failed to unassign staff', err);
            const typedErr = err as { response?: { data?: { message?: string } }; message?: string };
            const msg = typedErr.response?.data?.message || typedErr.message || 'Unknown error';
            toast.error(`${t('admin_team.error_revocation')} (${msg})`);
        }
    });


    const handleUnassign = (id: string) => {
        unassignMutation.mutate(id);
    };

    if (!event) return null;

    interface StaffMember { id: string; name: string; email?: string; }
    const availableStaff = globalStaff.filter((gs: StaffMember) => !staff.some((s: StaffMember) => s.id === gs.id));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-heading-color)' }}>
                    {t('admin_team.title_assign')}
                </h2>
                <p className="text-muted-foreground mt-1">
                    {t('admin_team.subtitle_assign')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Available Pool */}
                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            {t('admin_team.pool_title')}
                        </CardTitle>
                        <CardDescription>{t('admin_team.pool_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-1 max-h-[500px] overflow-auto pr-2">
                            {availableStaff.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8 italic">
                                    {t('admin_team.pool_empty')}
                                </p>
                            ) : (
                                availableStaff.map((member: StaffMember) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted transition-colors cursor-pointer group"
                                        onClick={() => assignMutation.mutate(member.id)}
                                    >
                                        <span className="font-medium">{member.name}</span>
                                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side: Assigned Team */}
                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            {t('admin_team.assigned_title_short')}
                        </CardTitle>
                        <CardDescription>{t('admin_team.assigned_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-1 max-h-[500px] overflow-auto pr-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : staff.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8 italic">
                                    {t('admin_team.assigned_empty')}
                                </p>
                            ) : (
                                staff.map((member: StaffMember) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 hover:border-destructive group transition-all"
                                    >
                                        <span className="font-medium">{member.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnassign(member.id);
                                            }}
                                            disabled={unassignMutation.isPending}
                                            title={t('admin_team.unassign')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
