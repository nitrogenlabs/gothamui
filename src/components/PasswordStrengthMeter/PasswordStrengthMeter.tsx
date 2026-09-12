import {cn} from '@nlabs/utils';
import {memo} from 'react';

import type {HTMLAttributes} from 'react';

export type PasswordStrength = {
  readonly label: string;
  readonly score: number;
};

export interface PasswordStrengthMeterProps extends HTMLAttributes<HTMLDivElement> {
  readonly password: string;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  if(password.length < 8) {
    return {
      label: 'Too short',
      score: 0
    };
  }

  const checks = [
    true,
    /[A-Za-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

  return {
    label: labels[score] || 'Strong',
    score
  };
};

const getSegmentClass = (score: number, segment: number) => {
  if(segment > score) {
    return 'bg-muted dark:bg-muted-dark';
  }

  if(score <= 1) {
    return 'bg-red-500';
  }

  if(score === 2) {
    return 'bg-amber-500';
  }

  if(score === 3) {
    return 'bg-primary dark:bg-primary-dark';
  }

  return 'bg-emerald-600';
};

const PasswordStrengthMeterComponent = ({
  className,
  password,
  ...props
}: PasswordStrengthMeterProps) => {
  if(!password) {
    return null;
  }

  const strength = getPasswordStrength(password);
  const segments = [1, 2, 3, 4];

  return (
    <div
      aria-label={`Password strength: ${strength.label}`}
      className={cn('grid gap-1.5', className)}
      data-slot="password-strength-meter"
      role="status"
      {...props}>
      <div aria-hidden className="grid grid-cols-4 gap-1.5">
        {segments.map((segment) => (
          <span
            className={cn('h-1.5 rounded-full transition-colors', getSegmentClass(strength.score, segment))}
            key={segment}
          />
        ))}
      </div>
      <p className="m-0 flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground-dark">
        <span>Password strength</span>
        <strong className="text-foreground dark:text-foreground-dark">{strength.label}</strong>
      </p>
    </div>
  );
};

export const PasswordStrengthMeter = memo(PasswordStrengthMeterComponent);
PasswordStrengthMeter.displayName = 'PasswordStrengthMeter';
