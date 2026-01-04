import { useEffect } from 'react';
import { useLocation, Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Share2 } from 'lucide-react';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { fireConfetti } from '@/lib/confetti';

export const ThankYouPage = () => {
    const { t } = useTranslation('common');
    const { config } = useAppConfig();
    const location = useLocation();
    const { slug } = useParams();
    const state = location.state as { amount?: number; transactionId?: string; donorName?: string } | null;

    useEffect(() => {
        fireConfetti();
    }, []);

    if (!state?.amount) {
        return <Navigate to="/donate" replace />;
    }

    const shareUrl = window.location.origin;
    const shareText = `I just donated to support this amazing cause! Join me at ${shareUrl}`;

    const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
        let url = '';
        switch (platform) {
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
        }
        window.open(url, '_blank', 'width=600,height=400');
    };

    return (
        <div
            className="min-h-screen animate-gradient-xy flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(to bottom right, var(--thankyou-gradient-start), var(--thankyou-gradient-via), var(--thankyou-gradient-end))' }}
        >
            <Card
                className="max-w-md w-full backdrop-blur-xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border-t rounded-3xl overflow-hidden"
                style={{
                    backgroundColor: 'var(--thankyou-card-bg)',
                    borderColor: 'var(--thankyou-card-border)',
                    borderRadius: 'var(--panel-radius, 1.5rem)'
                }}
            >
                <CardHeader className="text-center pb-2">
                    <div
                        className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'var(--thankyou-icon-bg)', outline: '4px solid rgba(220,252,231,0.3)' }}
                    >
                        <CheckCircle className="w-8 h-8" style={{ color: 'var(--thankyou-icon-color)' }} />
                    </div>
                    <CardTitle
                        className="text-3xl font-bold"
                        style={{ color: 'var(--thankyou-title-color)' }}
                    >
                        {t('donation.success')}
                    </CardTitle>
                    <CardDescription
                        className="text-lg mt-2"
                        style={{ color: 'var(--thankyou-message-color)' }}
                    >
                        {t('donation.success_detail', { amount: `$${state.amount}` })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div
                        className="p-4 rounded-lg space-y-2 text-sm"
                        style={{ backgroundColor: 'var(--thankyou-receipt-bg)' }}
                    >
                        {state.transactionId && (
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--thankyou-receipt-label)' }}>Transaction ID</span>
                                <span className="font-mono" style={{ color: 'var(--thankyou-receipt-text)' }}>{state.transactionId}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--thankyou-receipt-label)' }}>Date</span>
                            <span style={{ color: 'var(--thankyou-receipt-text)' }}>{new Date().toLocaleDateString()}</span>
                        </div>
                        {state.donorName && (
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--thankyou-receipt-label)' }}>{t('thankyou.receipt.from')}</span>
                                <span className="font-medium" style={{ color: 'var(--thankyou-receipt-text)' }}>{state.donorName}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="text-center text-sm font-medium flex items-center justify-center gap-2" style={{ color: 'var(--thankyou-share-label)' }}>
                            <Share2 className="w-4 h-4" />
                            Share your support
                        </div>
                        <div className="flex justify-center gap-4">
                            {config.donation.sharing?.enabled && config.donation.sharing.networks.map((network: string) => {
                                if (network === 'facebook') {
                                    return (
                                        <Button key={network} variant="outline" size="icon" onClick={() => handleShare('facebook')} className="hover:opacity-80 hover:text-[#1877F2] hover:border-[#1877F2]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                        </Button>
                                    );
                                }
                                if (network === 'twitter') {
                                    return (
                                        <Button key={network} variant="outline" size="icon" onClick={() => handleShare('twitter')} className="hover:opacity-80 hover:text-[#1DA1F2] hover:border-[#1DA1F2]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 12.5S1.2 5.3 7.6 4.5c2.1-.3 3.3.4 3.3.4s0-1.9 1.9-2.3c3-.7 5.1 2.3 5.4 3.5 1-.3 2.1-.8 2.1-.8s-.6 2.3-1.8 3.1c.9-.1 1.8-.3 1.8-.3s-.3 1.8-1.3 2.8" /></svg>
                                        </Button>
                                    );
                                }
                                if (network === 'linkedin') {
                                    return (
                                        <Button key={network} variant="outline" size="icon" onClick={() => handleShare('linkedin')} className="hover:opacity-80 hover:text-[#0A66C2] hover:border-[#0A66C2]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                        </Button>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        asChild
                        className="w-full h-12 text-lg hover:opacity-90"
                        style={{
                            backgroundColor: 'var(--thankyou-button-bg)',
                            color: 'var(--thankyou-button-text)'
                        }}
                    >
                        <Link to={`/${slug}/donate`}>
                            {t('donation.make_another')}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
