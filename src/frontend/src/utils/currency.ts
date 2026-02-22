/**
 * Utility functions for INR currency formatting
 */

/**
 * Format a bigint amount (stored in paise/cents) to INR display format
 * Uses Indian numbering system with proper comma placement
 * @param amount - Amount in paise (1 rupee = 100 paise)
 * @returns Formatted string with ₹ symbol (e.g., "₹1,999" or "₹1,23,456")
 */
export function formatINR(amount: bigint): string {
  const rupees = Number(amount);
  
  // Use Indian locale for proper formatting
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
  
  return formatted;
}

/**
 * Parse user input string to bigint for backend storage
 * Handles various input formats and returns amount in paise
 * @param input - User input string (e.g., "1999" or "1,999")
 * @returns Amount in paise as bigint, or null if invalid
 */
export function parseINRInput(input: string): bigint | null {
  // Remove commas and whitespace
  const cleaned = input.replace(/[,\s]/g, '');
  const num = parseFloat(cleaned);
  
  if (isNaN(num) || num < 0) {
    return null;
  }
  
  // Convert to paise (multiply by 100) and round
  return BigInt(Math.round(num));
}

/**
 * Format bigint amount for input field display
 * @param amount - Amount in paise
 * @returns String suitable for number input (e.g., "1999")
 */
export function formatINRForInput(amount: bigint): string {
  return Number(amount).toString();
}
