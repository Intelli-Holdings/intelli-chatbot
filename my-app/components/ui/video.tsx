import React from "react"
import { list } from '@vercel/blob'

interface VideoProps {
    fileName: string
}

export async function Video({ fileName }: VideoProps) {
    const { blobs } = await list({
        prefix: fileName,
        limit: 1,
    })
    const { url } = blobs[0]

    return (
        <video width="auto" height="auto" controls preload="none" aria-label="Video player">
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    )
}

// Usage example:
// <Suspense fallback={<p>Loading video...</p>}>
//   <Video fileName="your-video.mp4" />
// </Suspense>