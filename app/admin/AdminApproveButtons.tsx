'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AdminApproveButtons({ studioId }: { studioId: string }) {
  const router = useRouter()
  const [acting, setActing] = useState<string | null>(null)

  async function doAction(action: string) {
    setActing(action)
    try {
      await fetch(`/api/admin/studios/${studioId}/${action}`, { redirect: 'manual' })
      toast.success(action === 'approve' ? 'Studio approved and now live!' : 'Studio rejected.')
      router.refresh()
    } catch {
      toast.error('Action failed. Try again.')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => doAction('approve')} disabled={!!acting}
        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50">
        {acting === 'approve' ? '…' : 'Approve'}
      </button>
      <button onClick={() => doAction('reject')} disabled={!!acting}
        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
        {acting === 'reject' ? '…' : 'Reject'}
      </button>
    </div>
  )
}
