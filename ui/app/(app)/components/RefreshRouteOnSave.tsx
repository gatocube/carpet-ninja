'use client'

import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

/**
 * Component that enables live preview updates from Payload CMS admin panel.
 * When content is edited in the admin, this component refreshes the page.
 */
export const RefreshRouteOnSave: React.FC = () => {
    const router = useRouter()

    return (
        <PayloadRefreshRouteOnSave
            refresh={() => router.refresh()}
            serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ''}
        />
    )
}
