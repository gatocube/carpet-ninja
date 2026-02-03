import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// Store recent submissions to prevent duplicates (in-memory for now)
const recentSubmissions = new Map<string, number>()
const DUPLICATE_WINDOW_MS = 60000 // 1 minute

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, timestamp] of recentSubmissions.entries()) {
        if (now - timestamp > DUPLICATE_WINDOW_MS) {
            recentSubmissions.delete(key)
        }
    }
}, 300000)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, message, source = 'website' } = body

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            )
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        // Duplicate prevention: Check if same email+message was submitted recently
        const submissionKey = `${email}:${message.trim().substring(0, 50)}`
        const lastSubmissionTime = recentSubmissions.get(submissionKey)
        
        if (lastSubmissionTime) {
            const timeSinceLastSubmission = Date.now() - lastSubmissionTime
            if (timeSinceLastSubmission < DUPLICATE_WINDOW_MS) {
                return NextResponse.json(
                    { 
                        error: 'Duplicate submission detected. Please wait before submitting again.',
                        waitSeconds: Math.ceil((DUPLICATE_WINDOW_MS - timeSinceLastSubmission) / 1000)
                    },
                    { status: 429 }
                )
            }
        }

        // Record this submission
        recentSubmissions.set(submissionKey, Date.now())

        // Create contact request via Payload API
        const payload = await getPayloadClient()
        const contactRequest = await payload.create({
            collection: 'contact-requests',
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone?.trim() || null,
                message: message.trim(),
                source,
                status: 'new',
            },
        })

        return NextResponse.json(
            { 
                success: true,
                message: 'Thank you! We\'ll get back to you soon.',
                id: contactRequest.id
            },
            { status: 201 }
        )

    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Failed to submit contact request. Please try again.' },
            { status: 500 }
        )
    }
}
