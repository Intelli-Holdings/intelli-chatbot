'use server'
 
import { login } from '@/lib/auth/authService'
 
export async function authenticate(_currentState: unknown, formData: FormData) {
  try {
    await login('credentials', formData)
  } catch (error) {
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