import { useEvent } from '@/features/events/context/EventContext';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useDonationsTable, type DonationTableData } from '../hooks/useDonationsTable';
import { useState } from 'react';
import { EditDonationDialog } from '../components/EditDonationDialog';
import { CancelDonationDialog } from '../components/CancelDonationDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Loader2, Download, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';
import { timeAgo } from '@/lib/date';

export const DonationsPage = () => {
    const { event } = useEvent();
    const { t } = useTranslation('common');
    const { formatCurrency } = useCurrencyFormatter();

    if (!event) return null;

    const [editingDonation, setEditingDonation] = useState<DonationTableData | null>(null);
    const [cancellingDonation, setCancellingDonation] = useState<DonationTableData | null>(null);

    const {
        donations,
        total,
        pageCount,
        isLoading,
        page,
        setPage,
        search,
        setSearch,
        status,
        setStatus
    } = useDonationsTable(event.id);

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (event.id) params.append('eventId', event.id);
            if (search) params.append('search', search);
            if (status && status !== 'all') params.append('status', status);

            const response = await api.get(`/donations/export?${params.toString()}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `donations-${event.slug}-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            toast.error(t('donation.export_failed'));
        }
    };

    const handleExportPdf = async () => {
        try {
            const response = await api.get(`/export/receipts/zip?eventId=${event.id}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipts-${event.slug}-${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('PDF Export failed', error);
            toast.error(t('donation.export_failed'));
        }
    };

    const handleDownloadSingleReceipt = async (donationId: string) => {
        try {
            const response = await api.get(`/export/receipts/${donationId}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${donationId.substring(0, 8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Receipt download failed', error);
            toast.error(t('donation.receipt_failed'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-heading-color)' }}>
                        {t('admin_events.donations')}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        {t('admin_events.dashboard.manage_donations')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        {t('admin_events.export')}
                    </Button>
                    <Button variant="outline" onClick={handleExportPdf}>
                        <FileText className="mr-2 h-4 w-4" />
                        {t('admin_events.export_pdf')}
                    </Button>
                </div>
            </div>

            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('admin_events.donations_list')}</CardTitle>
                    <CardDescription>
                        {t('admin_events.showing_donations', { count: total, total })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Input
                            placeholder={t('admin_events.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="md:w-[300px]"
                        />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('admin_events.filter_status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('common.all')}</SelectItem>
                                <SelectItem value="COMPLETED">{t('status.completed')}</SelectItem>
                                <SelectItem value="PENDING">{t('status.pending')}</SelectItem>
                                <SelectItem value="FAILED">{t('status.failed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('donation.date')}</TableHead>
                                    <TableHead>{t('donation.donor')}</TableHead>
                                    <TableHead>{t('donation.amount')}</TableHead>
                                    <TableHead>{t('donation.status')}</TableHead>
                                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                            {t('common.loading')}
                                        </TableCell>
                                    </TableRow>
                                ) : donations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {t('common.no_results')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    donations.map((donation) => (
                                        <TableRow key={donation.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-xs text-muted-foreground">{timeAgo(donation.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{donation.isAnonymous ? t('donation.anonymous', 'Anonymous') : donation.donorName}</span>
                                                    <span className="text-xs text-muted-foreground">{donation.donorEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {formatCurrency(donation.amount / 100, { currency: donation.currency })}
                                                </div>
                                                <span className="text-xs text-muted-foreground capitalize">{donation.paymentMethod}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
                                                    ${(donation.status === 'COMPLETED' || donation.status === 'SUCCEEDED') ? 'bg-green-100 text-green-800' :
                                                        donation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {donation.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => setEditingDonation(donation)}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            {t('common.edit', 'Edit')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDownloadSingleReceipt(donation.id)}
                                                            disabled={donation.status !== 'COMPLETED'}
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            {t('admin_events.download_receipt', 'Receipt')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => setCancellingDonation(donation)}
                                                            disabled={donation.status === 'CANCELLED' || donation.status === 'REFUNDED'}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            {t('common.cancel', 'Cancel / Refund')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pageCount > 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                                            className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    <PaginationItem>
                                        <div className="flex items-center px-4 text-sm text-muted-foreground font-medium">
                                            Page {page} / {pageCount}
                                        </div>
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (page < pageCount) setPage(page + 1); }}
                                            className={page === pageCount ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>


            <EditDonationDialog
                donation={editingDonation}
                open={!!editingDonation}
                onOpenChange={(open) => !open && setEditingDonation(null)}
            />

            <CancelDonationDialog
                donation={cancellingDonation}
                open={!!cancellingDonation}
                onOpenChange={(open) => !open && setCancellingDonation(null)}
            />
        </div >
    );
};
