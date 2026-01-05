/**
 * Test page for Clerk + Django authentication
 *
 * This page demonstrates that Clerk JWT authentication is working correctly
 * with your Django backend.
 *
 * Access at: http://localhost:3000/test-auth
 */

import { UserProfileInfo } from '@/components/user-profile-info';
import { MyOrganizationsList } from '@/components/my-organizations-list';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔐 Authentication Test Page</h1>
              <p className="text-gray-600">
                Testing Clerk JWT authentication with Django backend
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/test-auth" />
              </SignedIn>
            </div>
          </div>
        </div>

        <SignedOut>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">Not Signed In</p>
            <p className="text-yellow-700 mb-4">
              Please sign in to test the authenticated API endpoints.
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-6">
            {/* Status Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-xl">✅</span>
                <p className="text-green-800 font-semibold">
                  Signed in with Clerk
                </p>
              </div>
              <p className="text-green-700 text-sm mt-1">
                The components below will automatically fetch data from your Django backend
                using your Clerk JWT token.
              </p>
            </div>

            {/* User Info Section */}
            <div>
              <h2 className="text-xl font-bold mb-3">👤 User Profile from Django</h2>
              <p className="text-gray-600 text-sm mb-4">
                Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">GET /auth/whoami/</code>
              </p>
              <UserProfileInfo />
            </div>

            {/* Organizations Section */}
            <div>
              <h2 className="text-xl font-bold mb-3">🏢 Your Organizations</h2>
              <p className="text-gray-600 text-sm mb-4">
                Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">GET /auth/my-organizations/</code>
              </p>
              <MyOrganizationsList />
            </div>

            {/* API Endpoints Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold mb-3">📚 Available Protected Endpoints</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono text-xs">GET</span>
                  <code className="text-gray-700">/auth/whoami/</code>
                  <span className="text-gray-500">- Get current user info</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono text-xs">GET</span>
                  <code className="text-gray-700">/auth/my-organizations/</code>
                  <span className="text-gray-500">- Get user&apos;s organizations</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono text-xs">GET</span>
                  <code className="text-gray-700">/auth/get/all/organizations/</code>
                  <span className="text-gray-500">- Get all organizations</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-xs">POST</span>
                  <code className="text-gray-700">/auth/update/organization/phone-number/</code>
                  <span className="text-gray-500">- Update org phone</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono text-xs">GET</span>
                  <code className="text-gray-700">/auth/get/org/{'<org_id>'}/phone-numbers/</code>
                  <span className="text-gray-500">- Get org phone numbers</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-xs">POST</span>
                  <code className="text-gray-700">/auth/onboarding/</code>
                  <span className="text-gray-500">- Create onboarding info</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-mono text-xs">PUT</span>
                  <code className="text-gray-700">/auth/onboarding/</code>
                  <span className="text-gray-500">- Update onboarding info</span>
                </div>
              </div>
            </div>

            {/* Debugging Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold mb-3">🔧 Debugging</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold mb-1">Backend URL:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}
                  </code>
                </div>
                <div>
                  <p className="font-semibold mb-1">Clerk Environment:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...
                  </code>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-gray-600 mb-2">If you see errors:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Make sure Django backend is running: <code className="bg-gray-100 px-1 rounded">python manage.py runserver</code></li>
                    <li>Check that <code className="bg-gray-100 px-1 rounded">CLERK_FRONTEND_API</code> is set in backend .env</li>
                    <li>Verify user has been synced from Clerk webhook</li>
                    <li>Check browser console for detailed error messages</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
