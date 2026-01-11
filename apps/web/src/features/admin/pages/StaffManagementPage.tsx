import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Loader2, Key, Edit, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@core/components/ConfirmationDialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@core/lib/api'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@core/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@core/components/ui/dialog'
import { staffSchema, type StaffFormValues } from '../schemas/staff.schema'

export const StaffManagementPage = () => {
    const { t } = useTranslation(['common', 'white-labeling'])
    const queryClient = useQueryClient()
    const [isAddOpen, setIsAddOpen] = useState(false)
    interface StaffMember {
        id: string
        name: string
        code: string
        _count?: { events: number }
    }
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['global-staff'],
        queryFn: async () => {
            const res = await api.get('/staff')
            return res.data
        },
    })

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            name: '',
            code: '',
        },
    })

    const createMutation = useMutation({
        mutationFn: async (values: StaffFormValues) => {
            if (editingStaff) {
                await api.put(`/staff/${editingStaff.id}`, values)
            } else {
                await api.post('/staff', values)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-staff'] })
            setIsAddOpen(false)
            setEditingStaff(null)
            form.reset()
            toast.success(
                editingStaff ? t('admin_team.member_updated') : t('admin_team.success_created'),
            )
        },
        onError: (err: unknown) => {
            console.error('Failed to save staff', err)
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                t('donation.error')
            toast.error(message)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/staff/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-staff'] })
            toast.success(t('admin_team.member_deleted'))
            setDeleteId(null) // Close the confirmation dialog
        },
        onError: () => {
            toast.error(t('admin_team.error_delete'))
        },
    })

    const onSubmit = (values: StaffFormValues) => {
        createMutation.mutate(values)
    }

    const handleEdit = (member: StaffMember) => {
        setEditingStaff(member)
        form.reset({
            name: member.name,
            code: member.code,
        })
        setIsAddOpen(true)
    }

    const handleDelete = (id: string) => {
        setDeleteId(id)
    }

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        {t('admin_team.loading_staff')}
                    </TableCell>
                </TableRow>
            )
        }

        if (staff.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        {t('admin_team.no_staff_found')}
                    </TableCell>
                </TableRow>
            )
        }

        return staff.map((member: StaffMember) => (
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
                        {t('admin_team.events_count', {
                            count: member._count?.events || 0,
                        })}
                    </span>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
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
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t('admin_team.manage_title')}
                    </h2>
                    <p className="text-muted-foreground mt-1">{t('admin_team.manage_subtitle')}</p>
                </div>

                <Dialog
                    open={isAddOpen}
                    onOpenChange={(open) => {
                        setIsAddOpen(open)
                        if (!open) {
                            setEditingStaff(null)
                            form.reset({ name: '', code: '' })
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin_team.add_member')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingStaff
                                    ? t('admin_team.edit_member')
                                    : t('admin_team.add_member')}
                            </DialogTitle>
                            <DialogDescription>
                                {editingStaff
                                    ? t('admin_team.edit_member_desc')
                                    : t('admin_team.create_member_desc')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('admin_team.member_name')}</Label>
                                <Input
                                    id="name"
                                    {...form.register('name')}
                                    placeholder={t('admin_team.member_placeholder')}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">{t('admin_team.pin_code')}</Label>
                                <Input
                                    id="code"
                                    {...form.register('code')}
                                    placeholder={t('admin_team.pin_placeholder')}
                                />
                                {form.formState.errors.code && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.code.message}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingStaff
                                        ? t('admin_team.save_changes')
                                        : t('admin_team.add_member')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <ConfirmationDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    onConfirm={() => deleteMutation.mutate(deleteId!)}
                    title={t('admin_team.confirm_delete_title')}
                    description={t('admin_team.confirm_delete_permanent')}
                    confirmText={t('common.delete')}
                    variant="destructive"
                />
            </div>

            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader>
                    <CardTitle>{t('admin_team.pool_title')}</CardTitle>
                    <CardDescription>{t('admin_team.pool_description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('admin_team.table_member')}</TableHead>
                                    <TableHead>{t('admin_team.table_pin')}</TableHead>
                                    <TableHead>{t('admin_team.table_assignments')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('common.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>{renderTableContent()}</TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
