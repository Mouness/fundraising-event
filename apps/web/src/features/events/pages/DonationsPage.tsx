import { useEvent } from '@/features/events/context/EventContext';
import { useDonationsTable } from '../hooks/useDonationsTable';
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
import { Loader2, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '@/lib/date';

export const DonationsPage = () => {
    const { event } = useEvent();
    const { t } = useTranslation('common');

    if (!event) return null;

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
            alert('Failed to export donations. Please try again.');
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
            alert('Failed to export receipts. Please try again.');
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
            alert('Failed to download receipt. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--admin-heading-color)' }}>
                        {t('admin_events.donations', 'Donations')}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        {t('admin_events.dashboard.manage_donations', 'Manage and track event donations')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        {t('admin_events.export', 'Export CSV')}
                    </Button>
                    <Button variant="outline" onClick={handleExportPdf}>
                        <FileText className="mr-2 h-4 w-4" />
                        {t('admin_events.export_pdf', 'Export PDFs (ZIP)')}
                    </Button>
                </div>
            </div>

            <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('admin_events.donations_list', 'All Donations')}</CardTitle>
                    <CardDescription>
                        {t('admin_events.showing_donations', { count: total, total })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Input
                            placeholder={t('admin_events.search_placeholder', 'Search by name or email...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="md:w-[300px]"
                        />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('admin_events.filter_status', 'Status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                                <SelectItem value="COMPLETED">{t('status.completed', 'Completed')}</SelectItem>
                                <SelectItem value="PENDING">{t('status.pending', 'Pending')}</SelectItem>
                                <SelectItem value="FAILED">{t('status.failed', 'Failed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('donation.date', 'Date')}</TableHead>
                                    <TableHead>{t('donation.donor', 'Donor')}</TableHead>
                                    <TableHead>{t('donation.amount', 'Amount')}</TableHead>
                                    <TableHead>{t('donation.status', 'Status')}</TableHead>
                                    <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                            {t('common.loading', 'Loading data...')}
                                        </TableCell>
                                    </TableRow>
                                ) : donations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {t('common.no_results', 'No donations found.')}
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
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: donation.currency }).format(donation.amount)}
                                                </div>
                                                <span className="text-xs text-muted-foreground capitalize">{donation.paymentMethod}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
                                                    ${donation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        donation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {donation.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownloadSingleReceipt(donation.id)}
                                                    title={t('admin_events.download_receipt', 'Download Receipt')}
                                                    disabled={donation.status !== 'COMPLETED'}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
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
        </div>
    );
};
