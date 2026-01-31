/**
 * Facebook SDK Initialization Utility
 * Initializes the Facebook JavaScript SDK for Embedded Signup
 */

export interface FacebookAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown'
  authResponse?: {
    accessToken: string
    expiresIn: string
    signedRequest: string
    userID: string
    grantedScopes?: string
    code?: string
  }
}

export interface FacebookSDK {
  init: (params: {
    appId: string
    cookie?: boolean
    xfbml?: boolean
    version: string
  }) => void
  login: (
    callback: (response: FacebookAuthResponse) => void,
    options?: {
      config_id?: string
      response_type?: string
      override_default_response_type?: boolean
      scope?: string
    }
  ) => void
  getLoginStatus: (callback: (response: FacebookAuthResponse) => void) => void
  AppEvents?: {
    logPageView: () => void
  }
}

/**
 * Initialize the Facebook SDK
 */
export const initializeFacebookSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if SDK is already loaded
    if (window.FB) {
      resolve()
      return
    }

    // Set up the async init function
    window.fbAsyncInit = function() {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie: true,
        xfbml: true,
        version: 'v22.0'
      })

      window.FB?.AppEvents?.logPageView()
      resolve()
    }

    // Load the SDK script
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'

    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode?.insertBefore(script, firstScript)
  })
}

/**
 * Launch Facebook Login with Embedded Signup for Messenger
 * Uses redirect-based OAuth flow
 */
export const launchMessengerEmbeddedSignup = (
  callback?: (response: FacebookAuthResponse) => void
): void => {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const configId = process.env.NEXT_PUBLIC_FACEBOOK_APP_CONFIG_ID_MESSENGER
  const redirectUri = process.env.NEXT_PUBLIC_MESSENGER_REDIRECT_URI ||
    `${window.location.origin}/messenger-redirect`

  const scope = 'email,pages_show_list,pages_messaging,pages_read_engagement,pages_read_user_content'

  // Build the OAuth URL for redirect-based flow
  const oauthUrl = new URL('https://www.facebook.com/v22.0/dialog/oauth')
  oauthUrl.searchParams.set('client_id', appId!)
  oauthUrl.searchParams.set('redirect_uri', redirectUri)
  oauthUrl.searchParams.set('scope', scope)
  oauthUrl.searchParams.set('response_type', 'code')
  if (configId) {
    oauthUrl.searchParams.set('config_id', configId)
  }

  // Redirect to Facebook OAuth
  window.location.href = oauthUrl.toString()
}

/**
 * Launch Facebook Login for Instagram (supports both Facebook and Instagram login)
 */
export const launchInstagramSignup = (
  callback: (response: FacebookAuthResponse) => void,
  useInstagramAuth: boolean = false
): void => {
  if (!window.FB) {
    console.error('Facebook SDK not initialized')
    return
  }

  const scope = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights,pages_show_list,pages_manage_metadata'

  window.FB.login(
    (response: FacebookAuthResponse) => {
      callback(response)
    },
    {
      response_type: 'code',
      override_default_response_type: true,
      scope: scope
    }
  )
}

/**
 * Check current Facebook login status
 */
export const checkLoginStatus = (
  callback: (response: FacebookAuthResponse) => void
): void => {
  if (!window.FB) {
    console.error('Facebook SDK not initialized')
    return
  }

  window.FB.getLoginStatus((response: FacebookAuthResponse) => {
    callback(response)
  })
}
