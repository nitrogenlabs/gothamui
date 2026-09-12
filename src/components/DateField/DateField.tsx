/**
 * Copyright (c) 2025-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {memo, useEffect, useMemo, useRef, useState} from 'react';

import {useIsMobile} from '../../hooks/useIsMobile.js';
import {getOutlineClasses} from '../../utils/colorUtils.js';
import {assignRef} from '../../utils/refUtils.js';
import {ErrorMessage} from '../ErrorMessage/ErrorMessage.js';
import {getFormErrorMessage, useGothamFormField} from '../Form/FormContext.js';
import {InputField, type InputFieldProps} from '../InputField/InputField.js';
import {Label} from '../Label/Label.js';
import {DatePicker} from './DatePicker.js';

import type {InputHTMLAttributes, Ref} from 'react';
import type {GothamColor} from '../../utils/colorUtils.js';

export interface DateFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly className?: string;
  readonly color?: GothamColor;
  readonly defaultValue?: number;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly labelClass?: string;
  readonly labelColor?: GothamColor;
  readonly name: string;
  readonly error?: boolean;
  readonly errorColor?: GothamColor;
  readonly maxDate?: number;
  readonly minDate?: number;
  readonly onChange?: (date) => void;
  readonly ref?: Ref<HTMLInputElement>;
  readonly value?: number;
}

const DateFieldComponent = ({
  className = 'w-full rounded-md outline-1 outline-solid focus:outline-3 px-3.5 py-2 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 sm:text-sm sm:leading-6',
  color = 'primary',
  defaultValue,
  disabled = false,
  error: externalError,
  label = '',
  labelClass = 'mb-1',
  labelColor = 'neutral',
  maxDate,
  minDate,
  name,
  onChange,
  ref,
  type = 'text',
  value,
  ...props
}: DateFieldProps) => {
  const isMobile = useIsMobile();
  const form = useGothamFormField(name);
  const formError = form?.error;
  const hasError = !!formError || !!externalError;
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ensureDateInRange = (timestamp: number): number => {
    if(!timestamp) {
      return timestamp;
    }

    if(minDate && timestamp < minDate) {
      return minDate;
    }

    if(maxDate && timestamp > maxDate) {
      return maxDate;
    }

    return timestamp;
  };

  const [localValue, setLocalValue] = useState(() => ensureDateInRange(value ?? defaultValue ?? Date.now()));
  const currentValue = Number(form?.value ?? value ?? localValue);
  const outlineClasses = useMemo(
    () => getOutlineClasses(hasError ? 'error' : color, {hasFocus: true, hasHover: true}),
    [color, hasError]
  );
  const inputClasses = [
    'bg-white/30 dark:bg-black/30',
    disabled ? 'text-neutral/30 dark:text-neutral-dark/30 outline-neutral/30 dark:outline-neutral-dark/30' : outlineClasses,
    className
  ].filter(Boolean).join(' ');

  const formatDateForInput = (timestamp: number): string => new Date(timestamp).toISOString().split('T')[0];

  const parseInputDate = (dateString: string): number => new Date(dateString).getTime();

  const isDateValid = (timestamp: number): boolean => {
    if(minDate && timestamp < minDate) {
      return false;
    }
    if(maxDate && timestamp > maxDate) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if(
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsPickerVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const setDateValue = (timestamp: number) => {
    const nextTimestamp = ensureDateInRange(timestamp);
    if(!form) {
      setLocalValue(nextTimestamp);
    }
    form?.setValue(name, nextTimestamp);

    if(isDateValid(nextTimestamp)) {
      form?.clearError(name);
    }

    onChange?.(nextTimestamp);
  };

  return (
    <div className="flex flex-col w-full">
      <Label
        className={labelClass}
        color={labelColor}
        hasError={hasError}
        label={label}
        name={name} />
      <div className="relative">
        <input name={name} type="hidden" value={currentValue || ''} />
        <InputField
          {...props as Omit<InputFieldProps, 'onChange'>}
          className={inputClasses}
          disabled={disabled}
          id={name}
          max={maxDate ? formatDateForInput(maxDate) : undefined}
          min={minDate ? formatDateForInput(minDate) : undefined}
          onChange={(changeEvent) => {
            setDateValue(parseInputDate(changeEvent.target.value));
          }}
          onFocus={() => {
            if(!isMobile) {
              setIsPickerVisible(true);
            }
          }}
          ref={(node) => {
            inputRef.current = node as HTMLInputElement | null;
            assignRef(ref, node as HTMLInputElement | null);
          }}
          type={isMobile ? 'date' : type}
          value={formatDateForInput(currentValue)}
        />
        {isPickerVisible && !disabled && !isMobile && (
          <div className="absolute z-10 mt-1" ref={pickerRef}>
            <DatePicker
              initialDate={currentValue}
              maxDate={maxDate}
              minDate={minDate}
              onDateSelect={(timestamp) => {
                setDateValue(timestamp);
                setIsPickerVisible(false);
              }}
            />
          </div>
        )}
        <ErrorMessage message={getFormErrorMessage(formError)} />
      </div>
    </div>
  );
};

export const DateField = memo(DateFieldComponent);
DateField.displayName = 'DateField';
