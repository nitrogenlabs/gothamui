import {z} from 'zod';

export const authSignInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
  rememberEmail: z.boolean()
});

export const authSignUpSchema = z.object({
  acceptTerms: z.boolean().refine(Boolean, 'Accept the terms to create an account.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.')
}).refine(({confirmPassword, password}) => confirmPassword === password, {
  message: 'Passwords must match.',
  path: ['confirmPassword']
});
