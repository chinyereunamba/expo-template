import * as yup from 'yup';

// Common validation messages
const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  password: {
    min: 'Password must be at least 8 characters',
    pattern:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
  confirmPassword: 'Passwords do not match',
  name: {
    min: 'Name must be at least 2 characters',
    max: 'Name must be less than 50 characters',
  },
  phone: 'Please enter a valid phone number',
};

// Base schemas
export const baseSchemas = {
  email: yup
    .string()
    .required(VALIDATION_MESSAGES.required('Email'))
    .email(VALIDATION_MESSAGES.email),

  password: yup
    .string()
    .required(VALIDATION_MESSAGES.required('Password'))
    .min(8, VALIDATION_MESSAGES.password.min)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      VALIDATION_MESSAGES.password.pattern
    ),

  name: yup
    .string()
    .required(VALIDATION_MESSAGES.required('Name'))
    .min(2, VALIDATION_MESSAGES.name.min)
    .max(50, VALIDATION_MESSAGES.name.max)
    .trim(),

  phone: yup
    .string()
    .matches(/^\+?[\d\s\-\(\)]{10,}$/, VALIDATION_MESSAGES.phone),
};

// Auth validation schemas
export const authSchemas = {
  login: yup.object({
    email: baseSchemas.email,
    password: yup
      .string()
      .required(VALIDATION_MESSAGES.required('Password'))
      .min(6, 'Password must be at least 6 characters'),
  }),

  register: yup.object({
    name: baseSchemas.name,
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: yup
      .string()
      .required(VALIDATION_MESSAGES.required('Confirm Password'))
      .oneOf([yup.ref('password')], VALIDATION_MESSAGES.confirmPassword),
  }),

  forgotPassword: yup.object({
    email: baseSchemas.email,
  }),

  resetPassword: yup.object({
    password: baseSchemas.password,
    confirmPassword: yup
      .string()
      .required(VALIDATION_MESSAGES.required('Confirm Password'))
      .oneOf([yup.ref('password')], VALIDATION_MESSAGES.confirmPassword),
  }),

  changePassword: yup.object({
    currentPassword: yup
      .string()
      .required(VALIDATION_MESSAGES.required('Current Password')),
    newPassword: baseSchemas.password,
    confirmPassword: yup
      .string()
      .required(VALIDATION_MESSAGES.required('Confirm Password'))
      .oneOf([yup.ref('newPassword')], VALIDATION_MESSAGES.confirmPassword),
  }),
};

// Profile validation schemas
export const profileSchemas = {
  updateProfile: yup.object({
    name: baseSchemas.name,
    email: baseSchemas.email,
    phone: baseSchemas.phone.optional(),
    bio: yup
      .string()
      .max(500, 'Bio must be less than 500 characters')
      .optional(),
  }),
};

// Contact/Support schemas
export const contactSchemas = {
  contactForm: yup.object({
    name: baseSchemas.name,
    email: baseSchemas.email,
    subject: yup
      .string()
      .required(VALIDATION_MESSAGES.required('Subject'))
      .min(5, 'Subject must be at least 5 characters')
      .max(100, 'Subject must be less than 100 characters'),
    message: yup
      .string()
      .required(VALIDATION_MESSAGES.required('Message'))
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message must be less than 1000 characters'),
  }),
};

// Export all schemas
export const validationSchemas = {
  ...authSchemas,
  ...profileSchemas,
  ...contactSchemas,
};

export { VALIDATION_MESSAGES };
