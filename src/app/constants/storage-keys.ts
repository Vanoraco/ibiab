export const StorageKeys = {
  LAST_REFRESH_ATTEMPT: 'sb_refresh_attempt',
  REFRESH_RETRY_COUNT: 'sb_refresh_retries',
  AUTH_TOKEN: 'sb-auth-token' // Fallback key if dynamic fails
} as const; 