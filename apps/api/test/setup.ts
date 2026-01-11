import { vi } from 'vitest'

// Global mock for pdfmake to prevent instantiation errors in E2E and integration tests
// that import modules depending on PdfService.
vi.mock('pdfmake', () => {
    return {
        default: class MockPdfPrinter {
            constructor() {
                return {
                    createPdfKitDocument: vi.fn(),
                }
            }
        },
    }
})
