export {};

declare global {
  interface Window {
    FB?: import('./components/EmbeddedSignup').FacebookSDK;
    fbAsyncInit?: () => void;
  }
}