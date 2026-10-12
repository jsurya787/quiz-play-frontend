import { BrowserCacheLocation, PublicClientApplication } from '@azure/msal-browser';

export function createMsalInstance(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'c1c86166-acae-4443-a174-c48b54a7b40a',
      authority: 'https://login.microsoftonline.com/common',
      redirectUri:
        typeof window === 'undefined'
          ? 'http://localhost:4200/redirect'
          : `${window.location.origin}/redirect`,
      postLogoutRedirectUri:
        typeof window === 'undefined' ? 'http://localhost:4200' : window.location.origin,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.SessionStorage,
    },
  });
}