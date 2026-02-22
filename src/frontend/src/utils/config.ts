/**
 * Configuration utilities for domain-specific settings
 */

/**
 * Get the base URL for the application
 * Adapts to deployment environment
 */
export function getBaseURL(): string {
  // In production with custom domain
  if (window.location.hostname === 'www.ols.in' || window.location.hostname === 'ols.in') {
    return 'https://www.ols.in';
  }
  
  // Development or IC default domain
  return window.location.origin;
}

/**
 * Get the application identifier for analytics and tracking
 */
export function getAppIdentifier(): string {
  return encodeURIComponent(window.location.hostname || 'ols-marketplace');
}

/**
 * Configuration constants
 */
export const APP_CONFIG = {
  name: 'OLS',
  fullName: 'On-Line Selling',
  domain: 'www.ols.in',
  supportEmail: 'support@ols.in',
  defaultCountryCode: '+91',
  otpLength: 6,
  otpExpiryMinutes: 10,
} as const;
