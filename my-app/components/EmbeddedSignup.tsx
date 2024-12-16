import { useEffect, useCallback } from 'react';

// Define types for Facebook SDK
interface FacebookSDK {
  init: (params: {
    appId: string;
    autoLogAppEvents: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    params: FacebookLoginParams
  ) => void;
}

interface FacebookLoginResponse {
  authResponse: {
    code: string;
    // Add other properties as needed
  } | null;
}

interface FacebookLoginParams {
  config_id: string;
  response_type: string;
  override_default_response_type: boolean;
  extras: {
    setup: Record<string, unknown>;
    featureType: string;
    sessionInfoVersion: string;
  };
}

// Extend Window interface to include FB
declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}

// Define type for WhatsApp embedded signup message
interface WhatsAppSignupMessage {
  type: string;
  event: 'FINISH' | 'CANCEL' | 'ERROR';
  data: {
    phone_number_id?: string;
    waba_id?: string;
    current_step?: string;
    error_message?: string;
  };
}

const EmbeddedSignup: React.FC = () => {
  const initializeFacebookSDK = useCallback(() => {
    if (window.FB) return;
    
    window.fbAsyncInit = function() {
      window.FB?.init({
        appId: '1643276069938705',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v21.0'
      });
    };

    // Load Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
  }, []);

  const handleFBLogin = useCallback((response: FacebookLoginResponse) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      // The returned code must be transmitted to your backend first and then
      // perform a server-to-server call from there to our servers for an access token.
    }
    const sdkResponseElement = document.getElementById("sdk-response");
    if (sdkResponseElement) {
      sdkResponseElement.textContent = JSON.stringify(response, null, 2);
    }
  }, []);

  const launchWhatsAppSignup = useCallback(() => {
    window.FB?.login(handleFBLogin, {
      config_id: '435858835887075',
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: '',
        sessionInfoVersion: '2',
      }
    });
  }, [handleFBLogin]);

  useEffect(() => {
    initializeFacebookSDK();

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }
      try {
        const data = JSON.parse(event.data) as WhatsAppSignupMessage;
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            console.log("Phone number ID ", phone_number_id, " WhatsApp business account ID ", waba_id);
          } else if (data.event === 'CANCEL') {
            const { current_step } = data.data;
            console.warn("Cancel at ", current_step);
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data;
            console.error("error ", error_message);
          }
        }
        const sessionInfoElement = document.getElementById("session-info-response");
        if (sessionInfoElement) {
          sessionInfoElement.textContent = JSON.stringify(data, null, 2);
        }
      } catch (error) {
        console.log('Non JSON Responses', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [initializeFacebookSDK]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div id="fb-root"></div>
      <button
        onClick={launchWhatsAppSignup}
        className="bg-[#1877f2] border-0 rounded-xl px-6 py-2 text-white cursor-pointer font-normal shadow-md hover:bg-[#1664d9] transition-colors"
      >
        Login with Facebook
      </button>
      <div className="w-full space-y-2">
        <p className="text-sm font-semibold">Session Info response:</p>
        <pre id="session-info-response" className="bg-gray-800/10 p-2 rounded text-xs overflow-auto max-h-32"></pre>
        <p className="text-sm font-semibold">SDK response:</p>
        <pre id="sdk-response" className="bg-gray-800/10 p-2 rounded text-xs overflow-auto max-h-32"></pre>
      </div>
    </div>
  );
};

export default EmbeddedSignup;