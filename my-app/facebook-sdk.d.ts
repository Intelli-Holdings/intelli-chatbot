export {};

declare global {
  interface Window {
    FB?: import('./lib/facebook-sdk').FacebookSDK;
    fbAsyncInit?: () => void;
  }
}