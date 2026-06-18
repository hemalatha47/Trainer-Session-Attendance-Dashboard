/**
 * validationUtils.js
 * Pure, stateless validation helpers (Module 1.2 Task 14).
 * No React imports, no side effects.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true if value is non-empty after trimming. */
export const isRequired = (value) => typeof value === 'string' && value.trim().length > 0;

/** Returns true if value matches a basic email pattern. */
export const isValidEmail = (value) => EMAIL_REGEX.test(String(value || '').trim());

/**
 * Validates login form fields.
 * @param {string} email
 * @param {string} password
 * @returns {{email?: string, password?: string}} fieldErrors — empty object if valid
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!isRequired(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!isRequired(password)) {
    errors.password = 'Password is required';
  }

  return errors;
};
