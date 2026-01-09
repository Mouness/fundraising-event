import i18n from './i18n'

export const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    if (seconds < 60) return i18n.t('date.just_now')

    const intervals = [
        { label: 'years_ago', seconds: 31536000 },
        { label: 'months_ago', seconds: 2592000 },
        { label: 'days_ago', seconds: 86400 },
        { label: 'hours_ago', seconds: 3600 },
        { label: 'minutes_ago', seconds: 60 },
    ]

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds)
        if (count >= 1) {
            return i18n.t(`date.${interval.label}`, { count })
        }
    }

    return i18n.t('date.seconds_ago', { count: Math.floor(seconds) })
}
