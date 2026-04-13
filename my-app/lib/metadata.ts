const BASE_URL = 'https://www.intelliconcierge.com';

export function getCanonicalUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
