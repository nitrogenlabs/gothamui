import {cn} from '@nlabs/utils';
import {memo, useMemo, useState} from 'react';

import {getCheckedClasses} from '../../utils/colorUtils.js';
import {useGothamFormField} from '../Form/FormContext.js';

import type {ChangeEvent, InputHTMLAttributes} from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'defaultValue'> {
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
  containerClass?: string;
  defaultValue?: boolean;
  description?: string;
  error?: string;
  label: string;
  labelClass?: string;
  name: string;
  optionClass?: string;
}

const CheckboxComponent = ({
  color = 'primary',
  label,
  defaultValue = false,
  description,
  error,
  containerClass = '',
  labelClass = '',
  name,
  optionClass = '',
  id,
  ...props
}: CheckboxProps) => {
  const form = useGothamFormField(name);
  const [localChecked, setLocalChecked] = useState(defaultValue);
  const optionClasses = useMemo(
    () => cn(optionClass, getCheckedClasses(color)),
    [color, optionClass]
  );
  const checkboxId = id || name || label.toLowerCase().replace(/\s+/g, '-');
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const currentValue = form?.value;
  const uncontrolledChecked = typeof currentValue === 'boolean' ? currentValue : localChecked;
  const checked = typeof props.checked === 'boolean' ? props.checked : uncontrolledChecked;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if(!form) {
      setLocalChecked(event.target.checked);
    }
    form?.setValue(name, event.target.checked);
    form?.clearError(name);
    props.onChange?.(event);
  };
  const baseCheckboxClasses = `
    col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white
    checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600
    indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2
    focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100
    disabled:checked:bg-gray-100 forced-colors:appearance-auto
    ${error ? 'border-red-300' : ''}
  `.trim().replace(/\s+/g, ' ');
  return (
    <fieldset aria-label={label}>
      <div className={`flex gap-3 ${containerClass}`}>
        <div className="flex h-6 shrink-0 items-center">
          <div className="group grid size-4 grid-cols-1">
            <input
              {...props}
              aria-describedby={descriptionId}
              checked={checked}
              className={`${baseCheckboxClasses} ${optionClasses}`}
              defaultChecked={checked === undefined ? Boolean(form?.defaultValue ?? defaultValue) : undefined}
              id={checkboxId}
              name={name}
              onChange={handleChange}
              type="checkbox"
              value="true"
            />
            <svg
              className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                className="opacity-0 group-has-checked:opacity-100"
                d="M3 8L6 11L11 3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
              <path
                className="opacity-0 group-has-indeterminate:opacity-100"
                d="M3 7H11"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>

        <div className="text-sm/6">
          <label
            className={`font-medium text-gray-900 ${labelClass}`}
            htmlFor={checkboxId}
          >
            {label}
          </label>
          {description && (
            <p className="text-gray-500" id={descriptionId}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
    </fieldset>
  );
};

export const Checkbox = memo(CheckboxComponent);
Checkbox.displayName = 'Checkbox';
