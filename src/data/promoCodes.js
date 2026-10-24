/**
 * Promo Codes Dataset (A1 Q7 Requirement 3)
 * Three verified promo codes:
 * 1. WELCOME10: 10% discount
 * 2. DASTAAN20: 20% discount
 * 3. FESTIVE50: Flat 50 PKR discount
 */

export const PROMO_CODES = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    description: '10% Welcome Discount'
  },
  DASTAAN20: {
    code: 'DASTAAN20',
    type: 'percentage',
    value: 20,
    description: '20% Heritage Royalty Discount'
  },
  FESTIVE50: {
    code: 'FESTIVE50',
    type: 'flat',
    value: 50,
    description: 'Flat Rs. 50 Festive Discount'
  }
};

/**
 * Validates promo code string (case-insensitive)
 * Returns { valid: true, promo } or { valid: false, error }
 */
export const validatePromoCode = (inputCode) => {
  if (!inputCode || typeof inputCode !== 'string') {
    return { valid: false, error: 'Please enter a promo code' };
  }

  const normalized = inputCode.trim().toUpperCase();
  const promo = PROMO_CODES[normalized];

  if (!promo) {
    return {
      valid: false,
      error: `Invalid promo code "${inputCode}". Try WELCOME10, DASTAAN20, or FESTIVE50.`
    };
  }

  return { valid: true, promo };
};
