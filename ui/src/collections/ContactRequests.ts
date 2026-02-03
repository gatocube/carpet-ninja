import type { CollectionConfig } from 'payload'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
            async ({ operation, doc, req }) => {
                // Only send email on create (new submissions)
                if (operation === 'create' && resend && process.env.CONTACT_NOTIFICATION_EMAIL) {
                    try {
                        const { name, email, phone, message } = doc

                        await resend.emails.send({
                            from: 'Carpet Ninja <noreply@carpet-ninja.com>',
                            to: process.env.CONTACT_NOTIFICATION_EMAIL,
                            subject: `🥷 New Contact Request from ${name}`,
                            html: `
                                <h2>New Contact Request</h2>
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                                <p><strong>Message:</strong></p>
                                <p>${message.replace(/\n/g, '<br>')}</p>
                                <hr>
                                <p><small>View in admin: ${process.env.NEXT_PUBLIC_SERVER_URL}/admin/collections/contact-requests/${doc.id}</small></p>
                            `,
                        })

                        req.payload.logger.info(`✅ Email notification sent to ${process.env.CONTACT_NOTIFICATION_EMAIL}`)
                    } catch (error) {
                        req.payload.logger.error(`❌ Failed to send email notification: ${error}`)
                    }
                }
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
