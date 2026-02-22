/**
 * Security utility functions for input sanitization and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags and attributes
 * @param input - Raw user input string
 * @returns Sanitized string safe for display
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Create a temporary div to leverage browser's HTML parsing
  const temp = document.createElement('div');
  temp.textContent = input;
  
  // Get the sanitized text content
  let sanitized = temp.innerHTML;
  
  // Additional sanitization: remove any remaining script-like patterns
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return sanitized;
}

/**
 * Validate phone number format
 * Accepts Indian phone numbers with optional country code
 * @param phone - Phone number string
 * @returns true if valid format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Indian phone number: 10 digits, optional +91 prefix
  const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const cleaned = phone.replace(/[\s-]/g, '');
  return indianPhoneRegex.test(cleaned);
}

/**
 * Validate email address format
 * @param email - Email address string
 * @returns true if valid format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize and validate OTP input
 * @param otp - OTP string
 * @returns Sanitized OTP or null if invalid
 */
export function validateOTP(otp: string): string | null {
  const cleaned = otp.replace(/\D/g, '');
  if (cleaned.length === 6) {
    return cleaned;
  }
  return null;
}

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @returns Formatted phone number (e.g., "+91 98765 43210")
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}
