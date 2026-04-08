// app/bookings/[id]/success/page.tsx
import { redirect } from 'next/navigation'
export default function PaymentSuccessPage({ params }: { params: { id: string } }) {
  redirect(`/bookings/${params.id}`)
}
