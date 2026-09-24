/**
 * Copyright (c) 2025-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {z} from 'zod';

import {Button, Form, TextField} from '../components/index.js';

// Define a comprehensive form schema
const userProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Please enter a valid age'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms')
});

type UserProfile = z.infer<typeof userProfileSchema>;

export const OptimizedFormExample = () => {
  const handleSubmit = async (data: UserProfile) => {
    console.log('Form submitted successfully:', data);
    // Handle success (show notification, redirect, etc.)
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

      <Form
        schema={userProfileSchema}
        onSubmit={handleSubmit}
        showErrors={true}
        mode="onBlur"
        defaultValues={{
          firstName: '',
          lastName: '',
          email: '',
          age: 18,
          bio: '',
          agreeToTerms: false
        }}
      >
        {({formState: {isSubmitting}}) => (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <TextField
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                required
              />

              <TextField
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
                required
              />
            </div>

            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              className="mb-4"
              required
            />

            <TextField
              name="age"
              label="Age"
              type="number"
              placeholder="Enter your age"
              className="mb-4"
              min={18}
              max={120}
              required
            />

            <TextField
              name="bio"
              label="Bio"
              placeholder="Tell us about yourself (optional)"
              multiline
              rows={4}
              className="mb-4"
            />

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                className="cursor-pointer mr-2"
              />
              <label htmlFor="agreeToTerms" className="text-sm">
                I agree to the terms and conditions
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                label="Save Profile"
                className="flex-1"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              />

              <Button
                type="button"
                variant="outlined"
                color="neutral"
                label="Cancel"
                onClick={() => console.log('Cancelled')}
              />
            </div>
          </>
        )}
      </Form>
    </div>
  );
};
