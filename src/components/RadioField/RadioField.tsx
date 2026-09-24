import {cn} from '@nlabs/utils';
import {memo, useMemo, useState} from 'react';

import {getCheckedClasses, type GothamColor} from '../../utils/colorUtils.js';
import {useGothamFormField} from '../Form/FormContext.js';

import type {FC} from 'react';

export interface RadioFieldItem {
  readonly description?: string;
  readonly id?: string;
  readonly label: string;
  readonly value: string;
}

export interface RadioFieldProps {
  readonly color?: GothamColor;
  readonly defaultValue?: string;
  readonly label?: string;
  readonly name: string;
  readonly optionClass?: string;
  readonly options: RadioFieldItem[];
}

const RadioFieldComponent: FC<RadioFieldProps> = ({
  color = 'primary',
  defaultValue,
  label,
  name,
  optionClass = 'cursor-pointer relative size-4 appearance-none rounded-full border border-neutral/70 dark:border-neutral-dark/70 bg-white dark:bg-black before:absolute before:inset-1 before:rounded-full before:bg-white dark:before:bg-black not-checked:before:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:border-black/40 dark:disabled:border-white/40 disabled:bg-white/50 dark:disabled:bg-black/50 disabled:before:bg-black/40 dark:disabled:before:bg-white/50 forced-colors:appearance-auto forced-colors:before:hidden',
  options
}) => {
  const form = useGothamFormField(name);
  const [localValue, setLocalValue] = useState(defaultValue);
  const optionClasses = useMemo(
    () => cn('cursor-pointer disabled:cursor-not-allowed', optionClass, getCheckedClasses(color)),
    [color, optionClass]
  );
  const currentValue = form?.value ?? localValue;
  return (
    <fieldset aria-label={label}>
      <div className="space-y-1">
        {options.map((option) => (
          <div className="flex items-start relative" key={option.id || option.value}>
            <div className="flex h-6 items-center">
              <input
                aria-describedby={`${option.id || option.value}-description`}
                checked={currentValue === option.value}
                className={optionClasses}
                id={option.id || option.value}
                name={name}
                onChange={() => {
                  if(!form) {
                    setLocalValue(option.value);
                  }
                  form?.setValue(name, option.value);
                  form?.clearError(name);
                }}
                type="radio"
                value={option.value}
              />
            </div>
            <div className="ml-3 text-sm/6">
              {option.label && (
                <label className="cursor-pointer font-medium text-gray-900 dark:text-white" htmlFor={option.id || option.value}>
                  {option.label}
                </label>
              )}
              {option.description && (
                <p className="text-gray-500 dark:text-white" id={`${option.id || option.value}-description`}>
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export const RadioField = memo(RadioFieldComponent);
RadioField.displayName = 'RadioField';
