'use server'

import { login } from '@/lib/auth/authService'

export async function authenticate(_currentState: unknown, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    await login({
      email,
      password,
      role: null,
      is_email_verified: false
    })
  } catch (error: any) {
    if (error) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}