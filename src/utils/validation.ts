// Validation utilities
export const ValidationUtils = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation
  isValidPassword: (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Name validation
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2;
  },

  // Phone number validation (basic)
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Required field validation
  isRequired: (value: string): boolean => {
    return value.trim().length > 0;
  },

  // Get password strength
  getPasswordStrength: (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean
    ).length;

    if (score >= 3) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  },
};
