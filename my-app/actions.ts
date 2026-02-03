'use server'

import { revalidatePath } from 'next/cache'
import { toast } from 'sonner'

export async function takeoverConversation(formData: FormData) {
  const phoneNumber = formData.get('phoneNumber')
  const customerNumber = formData.get('customerNumber')

  // TODO: Implement the actual takeover logic here
  console.log(`Takeover conversation: ${phoneNumber} -> ${customerNumber}`)

  // Revalidate the conversations page
  revalidatePath('/dashboard/conversations')

  return { success: true, message: 'Conversation taken over successfully' }
  toast.success('Conversation taken over successfully')
}

export async function handoverConversation(formData: FormData) {
  const phoneNumber = formData.get('phoneNumber')
  const customerNumber = formData.get('customerNumber')

  // TODO: Implement the actual handover logic here
  console.log(`Handover conversation: ${phoneNumber} -> ${customerNumber}`)

  // Revalidate the conversations page
  revalidatePath('/dashboard/conversations')

  return { success: true, message: 'Conversation handed over successfully' }
  toast.success('Conversation handed over successfully')
}

