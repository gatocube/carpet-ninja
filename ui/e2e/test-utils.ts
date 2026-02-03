import { Page, ConsoleMessage } from '@playwright/test'

/**
 * Shared E2E Test Utilities
 */

// Messages to ignore - known framework warnings
export const IGNORED_PATTERNS = [
    /favicon\.ico/i,
    /robots\.txt/i,
    /hydrat/i,
    /mismatch/i,
    /getFromImportMap/i,
    /ancestor stack trace/i,
    /validateDOMNesting/i,
    /react.*does not recognize/i,
    /Invalid prop/i,
    /Warning:/i,
    /Minified React error/i,
    /download the React DevTools/i,
    /Expected server HTML/i,
    /did not match/i,
    /framer-motion/i,
    /ResizeObserver/i,
    /AbortError/i,
    /ERR_BLOCKED/i,
    /404 \(Not Found\)/i,
    /Failed to load resource.*404/i,
    /\.png.*404/i,
    /\.jpg.*404/i,
    /\.webp.*404/i,
    /PayloadComponent not found/i,
    /generate:importmap/i,
]

// Real errors we should fail on
export const REAL_ERROR_PATTERNS = [
    /Uncaught TypeError/i,
    /Uncaught ReferenceError/i,
    /Uncaught SyntaxError/i,
    /Module not found/i,
    /ChunkLoadError/i,
    /Failed to fetch(?!.*abort)/i,
    /500 Internal Server Error/i,
    /Cannot read properties of null/i,
    /Cannot read properties of undefined/i,
]

export interface PageError {
    type: 'error' | 'warning' | 'resource'
    message: string
    page: string
}

export function shouldIgnoreError(text: string): boolean {
    return IGNORED_PATTERNS.some(pattern => pattern.test(text))
}

export function isRealError(text: string): boolean {
    return REAL_ERROR_PATTERNS.some(pattern => pattern.test(text))
}

export function setupConsoleMonitor(page: Page, pageName: string, errors: PageError[]) {
    page.on('console', (msg: ConsoleMessage) => {
        const text = msg.text()
        if (shouldIgnoreError(text)) return
        if (msg.type() === 'error' || isRealError(text)) {
            errors.push({ type: 'error', message: text, page: pageName })
        }
    })

    page.on('pageerror', (error) => {
        const errorText = error.message
        if (!shouldIgnoreError(errorText)) {
            errors.push({ type: 'error', message: errorText, page: pageName })
        }
    })

    page.on('requestfailed', (request) => {
        const url = request.url()
        if (/\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url)) return
        const failure = request.failure()
        if (failure?.errorText?.includes('net::ERR_ABORTED')) return
        errors.push({
            type: 'resource',
            message: `Failed to load: ${url} - ${failure?.errorText || 'unknown'}`,
            page: pageName,
        })
    })
}

export async function loginAsAdmin(page: Page, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await page.goto('/admin/login')
            await page.waitForLoadState('networkidle')

            // If already logged in (redirected), return
            if (!page.url().includes('/login')) return

            await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 15000 })
            await page.fill('input[name="email"]', 'admin@carpet-ninja.com')
            await page.fill('input[name="password"]', 'admin123')
            await page.click('button[type="submit"]')

            await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 })
            await page.waitForLoadState('networkidle')
            return
        } catch (error) {
            if (attempt === retries) throw error
            await page.waitForTimeout(2000 * attempt)
        }
    }
}
