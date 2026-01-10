import { ReceiptContext } from '../../mail/interfaces/receipt.interfaces'

export const getReceiptTemplate = (
    context: ReceiptContext,
    images: { logo: Buffer | string | null; signature: Buffer | string | null },
) => {
    const { logo, signature } = images
    // Amount is passed in major units (Dollars/Euros), so we just ensure it's a number.
    const amountVal =
        typeof context.amount === 'number' ? context.amount : parseFloat(context.amount || '0')

    return {
        content: [
            // Header Table (Logo + Address)
            {
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [
                            logo
                                ? {
                                      image: logo,
                                      width: 120,
                                  }
                                : { text: context.eventName, style: 'header' },
                            {
                                text: [
                                    {
                                        text: context.legalName || context.eventName,
                                        bold: true,
                                        fontSize: 12,
                                    },
                                    '\n',
                                    context.address || '',
                                    '\n',
                                    context.website || '',
                                    '\n',
                                    context.supportEmail || '',
                                    '\n',
                                    context.phone || '',
                                    context.phone || '',
                                    context.taxId
                                        ? `\n${context.content.taxIdLabel} ${context.taxId}`
                                        : '',
                                ],
                                alignment: 'right',
                                fontSize: 10,
                                color: '#555555',
                            },
                        ],
                    ],
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 40],
            },

            // Title
            {
                text: context.content.title.toUpperCase(),
                style: 'title',
                alignment: 'center',
                margin: [0, 0, 0, 20],
            },

            // Receipt Details
            {
                style: 'tableExample',
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            { text: context.content.receiptNumber, style: 'label' },
                            {
                                text: (context.transactionId || 'N/A')
                                    .substring(0, 12)
                                    .toUpperCase(),
                                style: 'value',
                            },
                        ],
                        [
                            { text: context.content.date, style: 'label' },
                            { text: context.date, style: 'value' },
                        ],
                        [
                            { text: context.content.donorName, style: 'label' },
                            {
                                text: context.donorName || context.name || 'Supporter',
                                style: 'value',
                            },
                        ],
                    ],
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 20],
            },

            // Amount Box
            {
                table: {
                    widths: ['*'],
                    body: [
                        [
                            {
                                text: [
                                    {
                                        text: context.content.amount + '\n',
                                        fontSize: 10,
                                        color: '#666666',
                                    },
                                    {
                                        text: `${amountVal.toFixed(2)} ${context.currency}`,
                                        fontSize: 24,
                                        bold: true,
                                        color: context.primaryColor,
                                    },
                                ],
                                alignment: 'center',
                                fillColor: '#f9fafb',
                                margin: [0, 15, 0, 15],
                            },
                        ],
                    ],
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 40],
            },

            // Signature Section
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 200,
                        stack: [
                            signature
                                ? { image: signature, width: 100, alignment: 'center' }
                                : { text: '', margin: [0, 30] },
                            {
                                canvas: [
                                    {
                                        type: 'line',
                                        x1: 0,
                                        y1: 5,
                                        x2: 200,
                                        y2: 5,
                                        lineWidth: 1,
                                        lineColor: '#cccccc',
                                    },
                                ],
                            },
                            {
                                text: context.signatureText || context.content.authorizedSignature,
                                alignment: 'center',
                                fontSize: 10,
                                bold: true,
                                margin: [0, 10, 0, 0],
                            },
                        ],
                    },
                ],
            },

            // Footer
            {
                text: context.footerText || 'Thank you for your generous support.',
                style: 'footer',
                alignment: 'center',
                margin: [0, 50, 0, 0],
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                color: context.primaryColor,
            },
            title: {
                fontSize: 16,
                bold: true,
                color: '#333333',
                letterSpacing: 2,
            },
            label: {
                fontSize: 10,
                color: '#666666',
                margin: [0, 5, 0, 5],
            },
            value: {
                fontSize: 12,
                bold: true,
                color: '#333333',
                alignment: 'right',
                margin: [0, 5, 0, 5],
            },
            footer: {
                fontSize: 9,
                color: '#999999',
                italics: true,
            },
        },
        defaultStyle: {
            font: 'Roboto',
        },
    }
}
