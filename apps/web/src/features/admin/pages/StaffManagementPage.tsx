import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Loader2, Key, Edit, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

// Schema for staff creation
const getStaffSchema = (t: any) => z.object({
    name: z.string().min(2, t('validation.min_chars', { count: 2 })),
    code: z.string()
        .min(4, t('validation.min_chars', { count: 4 }))
        .max(6, t('validation.max_chars', { count: 6 })),
});

type StaffFormValues = z.infer<ReturnType<typeof getStaffSchema>>;

export const StaffManagementPage = () => {
    const { t } = useTranslation(['common', 'white-labeling']);
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any>(null);

    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['global-staff'],
        queryFn: async () => {
            const res = await api.get('/staff');
            return res.data;
        },
    });

    const staffSchema = getStaffSchema(t);
    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            name: '',
            code: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: async (values: StaffFormValues) => {
            if (editingStaff) {
                await api.put(`/staff/${editingStaff.id}`, values);
            } else {
                await api.post('/staff', values);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-staff'] });
            setIsAddOpen(false);
            setEditingStaff(null);
            form.reset();
        },
        onError: (err: any) => {
            console.error('Failed to save staff', err);
            const message = err.response?.data?.message || t('donation.error', 'Something went wrong. Please try again.');
            alert(message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/staff/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-staff'] });
        },
    });

    const onSubmit = (values: StaffFormValues) => {
        createMutation.mutate(values);
    };

    const handleEdit = (member: any) => {
        setEditingStaff(member);
        form.reset({
            name: member.name,
            code: member.code,
        });
        setIsAddOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm(t('admin_team.confirm_delete_permanent', 'Are you sure? This will permanently delete this volunteer from all events.'))) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('admin_team.manage_title', 'Staff Management')}</h2>
                    <p className="text-muted-foreground mt-1">
                        {t('admin_team.manage_subtitle', 'Manage the global pool of volunteers and their PIN codes.')}
                    </p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) {
                        setEditingStaff(null);
                        form.reset({ name: '', code: '' });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin_team.add_member', 'Add Member')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingStaff ? t('admin_team.edit_member') : t('admin_team.add_member', 'Add Member')}</DialogTitle>
                            <DialogDescription>
                                {editingStaff ? t('admin_team.edit_member_desc') : t('admin_team.create_member_desc')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('admin_team.member_name', 'Member Name')}</Label>
                                <Input id="name" {...form.register('name')} placeholder={t('admin_team.member_placeholder', 'e.g. John Doe')} />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">{t('admin_team.pin_code', 'PIN Code')}</Label>
                                <Input id="code" {...form.register('code')} placeholder="1234" />
                                {form.formState.errors.code && (
                                    <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingStaff ? t('admin_team.save_changes') : t('admin_team.add_member', 'Add Member')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('admin_team.pool_title', 'Staff Pool')}</CardTitle>
                    <CardDescription>
                        {t('admin_team.pool_description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('admin_team.table_member')}</TableHead>
                                    <TableHead>{t('admin_team.table_pin')}</TableHead>
                                    <TableHead>{t('admin_team.table_assignments')}</TableHead>
                                    <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                            {t('admin_team.loading_staff')}
                                        </TableCell>
                                    </TableRow>
                                ) : staff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            {t('admin_team.no_staff_found')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    staff.map((member: any) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Users className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="font-medium">{member.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Key className="h-3 w-3" />
                                                    <span className="font-mono">{member.code}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                    {t('admin_team.events_count', { count: member._count?.events || 0 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(member)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(member.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
