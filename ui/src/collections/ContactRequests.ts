import type { CollectionConfig } from 'payload'

// Email address to receive contact form notifications
const NOTIFICATION_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || 'giorgi2510774@mail.ru'

export const ContactRequests: CollectionConfig = {
    slug: 'contact-requests',
    labels: {
        singular: 'Contact Request',
        plural: 'Contact Requests',
    },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'phone', 'status', 'createdAt'],
    },
    access: {
        read: () => true,
        create: () => true, // Allow public form submissions
    },
    hooks: {
        afterChange: [
            async ({ doc, operation, req }) => {
                // Only send email on new contact request creation
                if (operation !== 'create') return doc

                try {
                    // Check if email is configured
                    if (!process.env.RESEND_API_KEY) {
                        req.payload.logger.warn('RESEND_API_KEY not configured, skipping email notification')
                        return doc
                    }

                    // Send notification email
                    await req.payload.sendEmail({
                        to: NOTIFICATION_EMAIL,
                        subject: `🏠 New Contact Request from ${doc.name}`,
                        html: `
                            <h2>New Contact Request Received</h2>
                            <p><strong>Name:</strong> ${doc.name}</p>
                            <p><strong>Email:</strong> ${doc.email}</p>
                            <p><strong>Phone:</strong> ${doc.phone || 'Not provided'}</p>
                            <p><strong>Message:</strong></p>
                            <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #555;">
                                ${doc.message}
                            </blockquote>
                            <p><strong>Source:</strong> ${doc.source || 'Website'}</p>
                            <hr />
                            <p><small>Received at ${new Date().toLocaleString()}</small></p>
                            <p><a href="${process.env.NEXT_PUBLIC_SERVER_URL || 'https://carpet-ninja.vercel.app'}/admin/collections/contact-requests/${doc.id}">View in Admin</a></p>
                        `,
                    })

                    req.payload.logger.info(`✅ Email notification sent to ${NOTIFICATION_EMAIL} for contact request from ${doc.name}`)
                } catch (error) {
                    req.payload.logger.error(`❌ Failed to send email notification: ${error instanceof Error ? error.message : String(error)}`)
                }

                return doc
            },
        ],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            type: 'email',
            required: true,
        },
        {
            name: 'phone',
            type: 'text',
        },
        {
            name: 'message',
            type: 'textarea',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'new',
            options: [
                { label: 'New', value: 'new' },
                { label: 'Contacted', value: 'contacted' },
                { label: 'Closed', value: 'closed' },
            ],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'source',
            type: 'text',
            admin: {
                position: 'sidebar',
                description: 'Where the request came from',
            },
        },
    ],
}
