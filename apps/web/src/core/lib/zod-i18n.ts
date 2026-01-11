import { z } from 'zod'
import i18next from 'i18next'

const zodErrorMap = (issue: any, ctx: any) => {
    // Explicitly handle ctx being undefined or null
    const defaultError = ctx && ctx.defaultError ? ctx.defaultError : undefined
    let message = defaultError || issue.message
    const code = issue.code as string

    // Loose comparison for Zod 4 compatibility where enums might have changed
    if (code === 'invalid_type') {
        if ((issue as any).received === 'undefined' || (issue as any).received === 'null') {
            message = i18next.t('validation.required', 'This field is required')
        } else {
            message = i18next.t('validation.invalid_type', {
                expected: (issue as any).expected,
                received: (issue as any).received,
                defaultValue: defaultError,
            })
        }
    } else if (code === 'too_small') {
        message = i18next.t(`validation.too_small.${(issue as any).type}`, {
            count: Number((issue as any).minimum),
            defaultValue: defaultError,
        })
    } else if (code === 'too_big') {
        message = i18next.t(`validation.too_big.${(issue as any).type}`, {
            count: Number((issue as any).maximum),
            defaultValue: defaultError,
        })
    } else if (code === 'invalid_string' || code === 'invalid_format') {
        if (typeof (issue as any).validation === 'string') {
            message = i18next.t(`validation.invalid_string.${(issue as any).validation}`, {
                defaultValue: defaultError,
            })
        }
    } else if (code === 'invalid_enum_value' || code === 'invalid_value') {
        const options = (issue as any).options || []
        message = i18next.t('validation.invalid_enum_value', {
            options: options.join(', '),
            defaultValue: defaultError,
        })
    } else if (code === 'invalid_date') {
        message = i18next.t('validation.invalid_date', {
            defaultValue: defaultError,
        })
    } else if (code === 'not_multiple_of') {
        message = i18next.t('validation.not_multiple_of', {
            multipleOf: Number((issue as any).multipleOf),
            defaultValue: defaultError,
        })
    } else if (code === 'not_finite') {
        message = i18next.t('validation.not_finite', {
            defaultValue: defaultError,
        })
    } else if (code === 'custom') {
        message = i18next.t('validation.custom', {
            defaultValue: defaultError,
        })
    }

    return { message }
}

z.setErrorMap(zodErrorMap as any)

export default zodErrorMap
