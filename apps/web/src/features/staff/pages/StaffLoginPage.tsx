import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@core/components/ui/card'
import { Label } from '@core/components/ui/label'
import { useStaffAuth } from '../hooks/useStaffAuth'
import { useEvent } from '@features/events/context/EventContext'

export const StaffLoginPage = () => {
    const { t } = useTranslation('common')
    const { event } = useEvent()
    const { login, isLoading, isStaffAuthenticated } = useStaffAuth()
    const navigate = useNavigate()
    const { slug } = useParams<{ slug: string }>()
    const [code, setCode] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (event && isStaffAuthenticated(event.id) && slug) {
            navigate(`/${slug}/staff/collect`)
        }
    }, [event, isStaffAuthenticated, navigate, slug])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!event) return

        const result = await login(code, event.id)
        if (!result.success) {
            setError(result.error || 'Authentication failed')
        }
    }

    if (!event) return null

    return (
        <div
            className="flex items-center justify-center min-h-screen p-4"
            style={{ backgroundColor: 'var(--auth-page-bg)' }}
        >
            <Card
                className="w-full max-w-md backdrop-blur-md shadow-xl border-t rounded-3xl overflow-hidden"
                style={{
                    borderRadius: 'var(--auth-card-radius)',
                    borderColor: 'var(--auth-input-border)',
                    boxShadow: 'var(--auth-card-shadow)',
                }}
            >
                <CardHeader>
                    <CardTitle
                        className="text-2xl text-center"
                        style={{ color: 'var(--auth-title-color)' }}
                    >
                        {t('staff.login.title', 'Staff Access')}
                    </CardTitle>
                    <CardDescription
                        className="text-center"
                        style={{ color: 'var(--auth-subtitle-color)' }}
                    >
                        {t('staff.login.subtitle', 'Enter your PIN to start collecting donations')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 text-center">
                            <Label
                                htmlFor="code"
                                className="text-lg"
                                style={{ color: 'var(--auth-label-color)' }}
                            >
                                {t('staff.login.pin_label', 'PIN Code')}
                            </Label>
                            <Input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="••••"
                                className="h-16 text-3xl text-center tracking-widest font-mono"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                autoFocus
                                style={{
                                    backgroundColor: 'var(--auth-input-bg)',
                                    color: 'var(--auth-input-text)',
                                    borderColor: 'var(--auth-input-border)',
                                }}
                            />
                            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg"
                            disabled={isLoading || !code}
                            style={{
                                backgroundColor: 'var(--auth-button-bg)',
                                color: 'var(--auth-button-text)',
                            }}
                        >
                            {isLoading
                                ? t('staff.login.loading', 'Connecting...')
                                : t('staff.login.submit', 'Connect')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
