import { z } from 'zod'
import i18next from 'i18next'

const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
    let message = ctx.defaultError

    switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
            if (issue.received === 'undefined' || issue.received === 'null') {
                message = i18next.t('validation.required', 'This field is required')
            } else {
                message = i18next.t('validation.invalid_type', {
                    expected: issue.expected,
                    received: issue.received,
                    defaultValue: ctx.defaultError,
                })
            }
            break
        case z.ZodIssueCode.too_small:
            message = i18next.t(`validation.too_small.${issue.type}`, {
                count: Number(issue.minimum),
                defaultValue: ctx.defaultError,
            })
            break
        case z.ZodIssueCode.too_big:
            message = i18next.t(`validation.too_big.${issue.type}`, {
                count: Number(issue.maximum),
                defaultValue: ctx.defaultError,
            })
            break
        case z.ZodIssueCode.invalid_string:
            if (typeof issue.validation === 'string') {
                message = i18next.t(`validation.invalid_string.${issue.validation}`, {
                    defaultValue: ctx.defaultError,
                })
            }
            break
        case z.ZodIssueCode.invalid_enum_value:
            message = i18next.t('validation.invalid_enum_value', {
                options: issue.options.join(', '),
                defaultValue: ctx.defaultError,
            })
            break
        case z.ZodIssueCode.invalid_date:
            message = i18next.t('validation.invalid_date', {
                defaultValue: ctx.defaultError,
            })
            break
        case z.ZodIssueCode.not_multiple_of:
            message = i18next.t('validation.not_multiple_of', {
                multipleOf: Number(issue.multipleOf),
                defaultValue: ctx.defaultError,
            })
            break
        case z.ZodIssueCode.not_finite:
            message = i18next.t('validation.not_finite', {
                defaultValue: ctx.defaultError,
            })
            break
        case z.ZodIssueCode.custom:
            message = i18next.t('validation.custom', {
                defaultValue: ctx.defaultError,
            })
            break
    }

    return { message }
}

z.setErrorMap(zodErrorMap)

export default zodErrorMap
