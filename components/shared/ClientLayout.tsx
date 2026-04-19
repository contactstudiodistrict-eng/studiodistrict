'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProfileCompletionModal } from '@/components/profile/ProfileCompletionModal'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const result = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
      const profile = result.data as { first_name: string | null; last_name: string | null } | null

      if (!profile?.first_name?.trim() || !profile?.last_name?.trim()) {
        setShowModal(true)
      }
    }

    checkProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') checkProfile()
      if (event === 'SIGNED_OUT') setShowModal(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      {children}
      {showModal && (
        <ProfileCompletionModal onComplete={() => setShowModal(false)} />
      )}
    </>
  )
}
