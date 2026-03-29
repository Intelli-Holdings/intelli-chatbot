"use client"

import dynamic from 'next/dynamic'

const PostHogPageView = dynamic(() => import('./PostHogPageView'), { ssr: false })
const ConsentGate = dynamic(() => import('@/components/consent-gate'), { ssr: false })
const AttentionBadge = dynamic(() => import('@/components/AttentionBadge'), { ssr: false })
const PointerEventsFix = dynamic(() => import('@/components/pointer-events-fix'), { ssr: false })
const ToastProvider = dynamic(() => import('@/components/ToastProvider'), { ssr: false })

export default function ClientLayoutComponents() {
  return (
    <>
      <ConsentGate />
      <AttentionBadge />
      <PostHogPageView />
      <PointerEventsFix />
      <ToastProvider />
    </>
  )
}
