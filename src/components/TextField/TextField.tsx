/**
 * Copyright (c) 2025-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {memo, useState} from 'react';

import {useTranslation} from '../../i18n/index.js';
import {Eye, EyeOff} from '../../icons/index.js';
import {ErrorMessage} from '../ErrorMessage/ErrorMessage.js';
import {getFormErrorMessage, useGothamFormField} from '../Form/FormContext.js';
import {InputField} from '../InputField/InputField.js';
import {Label} from '../Label/Label.js';

import type {InputHTMLAttributes, Ref} from 'react';
import type {GothamColor} from '../../utils/colorUtils.js';
import type {InputBorderType} from '../InputField/InputField.js';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  readonly borderColor?: GothamColor;
  readonly borderType?: InputBorderType;
  readonly className?: string;
  readonly color?: GothamColor;
  readonly defaultValue?: string;
  readonly error?: boolean;
  readonly errorColor?: GothamColor;
  readonly hasError?: boolean;
  readonly inputClass?: string;
  readonly label?: string;
  readonly labelClass?: string;
  readonly labelColor?: GothamColor;
  readonly multiline?: boolean;
  readonly name: string;
  readonly onValidate?: (isValid: boolean) => void;
  readonly pattern?: string;
  readonly placeholderColor?: GothamColor;
  readonly ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
  readonly rows?: number;
  readonly showPasswordToggle?: boolean;
  readonly textFillColor?: string;
  readonly textColor?: GothamColor;
  readonly type?: string;
}

const TextFieldComponent = ({
  borderColor = 'black',
  borderType,
  className,
  color = 'neutral',
  defaultValue = '',
  error: externalError,
  errorColor = 'error',
  inputClass,
  label = '',
  labelClass = 'mb-1',
  labelColor = 'neutral',
  multiline = false,
  name,
  onChange: onChangeProp,
  onValidate,
  pattern,
  placeholder = '',
  placeholderColor = 'neutral',
  ref,
  rows,
  showPasswordToggle = false,
  textFillColor,
  textColor = 'neutral',
  type = 'text',
  value,
  ...restInputProps
}: TextFieldProps) => {
  const {t} = useTranslation();
  const form = useGothamFormField(name);
  const formError = form?.error;
  const hasError = !!formError || !!externalError;
  const placeholderText = placeholder ? t(placeholder) : '';
  const [showPassword, setShowPassword] = useState(false);
  const fieldValue = value ?? form?.value ?? (form ? String(form.defaultValue ?? defaultValue) : undefined);
  const resolvedDefaultValue = fieldValue === undefined ? String(form?.defaultValue ?? defaultValue) : undefined;
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    form?.setValue(name, e.target.value);
    form?.clearError(name);
    onChangeProp?.(e);

    if(onValidate && pattern) {
      const isValid = new RegExp(pattern).test(e.target.value);
      onValidate(isValid);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Label
        className={labelClass}
        color={labelColor}
        label={label}
        name={name}
      />
      <div className="relative">
        <InputField
          {...restInputProps}
          borderColor={borderColor}
          borderType={borderType}
          className={inputClass}
          color={hasError ? 'error' : color}
          defaultValue={resolvedDefaultValue}
          id={name}
          multiline={multiline}
          name={name}
          onBlur={(event) => {
            restInputProps.onBlur?.(event);
          }}
          onChange={handleChange}
          onFocus={(event) => {
            restInputProps.onFocus?.(event);
          }}
          placeholder={placeholderText}
          placeholderColor={placeholderColor}
          ref={ref}
          textColor={textColor}
          textFillColor={textFillColor}
          type={inputType}
          value={fieldValue as string | number | readonly string[] | undefined}
        />
        {type === 'password' && showPasswordToggle && (
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className={`absolute inset-y-0 flex items-center ${
              borderType === 'underline' ? 'right-0 pr-3' : 'right-0 pr-3.5'
            } text-neutral-400 hover:text-neutral-600 outline-none focus:outline-none focus-visible:outline-none dark:text-neutral-500 dark:hover:text-neutral-300`}
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>
        )}
        <ErrorMessage
          color={errorColor}
          message={getFormErrorMessage(formError) || (externalError ? 'Invalid input' : undefined)}
        />
      </div>
    </div>
  );
};

export const TextField = memo(TextFieldComponent);
TextField.displayName = 'TextField';
