'use client';

import {Label, Listbox, ListboxButton, ListboxOptions} from '@headlessui/react';
import {cn} from '@nlabs/utils';
import {ChevronDown} from 'lucide-react';
import {memo, useId, useMemo, useRef, useState} from 'react';

import {useIsMobile} from '../../hooks/useIsMobile.js';
import {getBackgroundClasses, getOutlineClasses, getTextClasses} from '../../utils/colorUtils.js';
import {useGothamFormField} from '../Form/FormContext.js';
import {InputBorderType, getInputBorderClass} from '../InputField/InputField.js';
import {Svg} from '../Svg/Svg.js';
import {SelectFieldOption, SelectOption} from './SelectOption.js';

import type {ReactElement} from 'react';
import type {GothamColor} from '../../utils/colorUtils.js';

export type SelectFieldProps = {
  readonly backgroundColor?: GothamColor;
  readonly borderColor?: GothamColor;
  readonly borderType?: InputBorderType;
  readonly className?: string;
  readonly color?: GothamColor;
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly label?: string;
  readonly labelColor?: GothamColor;
  readonly labelClass?: string;
  readonly name: string;
  readonly onChange?: (value: string) => void;
  readonly options: SelectFieldOption[];
  readonly required?: boolean;
  readonly showChevron?: boolean;
  readonly value?: string;
};

const SelectFieldComponent = ({
  backgroundColor = 'transparent',
  borderColor = 'black',
  borderType = 'solid',
  className = 'cursor-default grid outline-1 w-full grid-cols-1 rounded-md px-3.5 py-2 text-left sm:text-sm/6',
  color = 'primary',
  defaultValue,
  disabled = false,
  id,
  label,
  labelClass,
  labelColor = 'neutral',
  name,
  onChange: onValueChange,
  options,
  required = false,
  showChevron = true,
  value
}: SelectFieldProps): ReactElement => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const fieldId = id || generatedId;
  const isMobile = useIsMobile();
  const form = useGothamFormField(name);
  const [localValue, setLocalValue] = useState(defaultValue ?? '');
  const fieldValue = value ?? form?.value ?? localValue;
  const normalizedFieldValue = fieldValue === undefined || fieldValue === null ? '' : String(fieldValue);
  const selectClasses = useMemo(() => cn(
    'flex relative w-full min-h-11 items-center justify-between px-3.5 py-2 text-left',
    getInputBorderClass(borderType, borderColor, color, 'transparent'), className), [borderType, borderColor, color, className]
  );
  const nativeSelectClasses = useMemo(() => cn(
    selectClasses,
    'appearance-none',
    {'pr-10': showChevron}
  ), [selectClasses, showChevron]);
  const labelClasses = useMemo(() => cn(
    labelClass,
    'block text-sm/6 font-medium',
    getTextClasses(labelColor)
  ), [labelClass, labelColor]);
  const optionsClasses = useMemo(() => cn(
    'absolute z-10 max-h-56 w-full overflow-auto rounded-md py-1 text-base focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm',
    getBackgroundClasses('white'),
    getOutlineClasses(color, {hasFocus: true, hasHover: true})
  ), [backgroundColor, color]);
  const chevronClasses = useMemo(() => cn(
    'col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end sm:size-4',
    getTextClasses(color)
  ), [color]);
  const selected = useMemo(
    () => options.find((option) => String(option?.value) === normalizedFieldValue),
    [normalizedFieldValue, options]
  );

  const onChange = (nextValue: string) => {
    if(disabled) {
      return;
    }
    if(!form && value === undefined) {
      setLocalValue(String(nextValue));
    }
    form?.setValue(name, String(nextValue));
    form?.clearError(name);
    onValueChange?.(String(nextValue));
  };

  return isMobile ? (
    <div className="w-full">
      {label && <label className={labelClasses} htmlFor={fieldId}>{label}</label>}
      <div className="relative w-full">
        <select
          className={nativeSelectClasses}
          disabled={disabled}
          id={fieldId}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          value={normalizedFieldValue}>
          {options.map((option) => (
            <option key={option.id} value={String(option.value)}>{option.label}</option>
          ))}
        </select>
        {showChevron ? (
          <ChevronDown
            aria-hidden="true"
            className={cn('pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2', getTextClasses(color))}
          />
        ) : null}
      </div>
    </div>
  ) : (
    <div className="flex flex-col w-full">
      <Listbox disabled={disabled} onChange={onChange} value={normalizedFieldValue}>
        <Label className={labelClasses}>
          {label}
        </Label>
        <select
          aria-hidden="true" className="sr-only" disabled={disabled} name={name}
          onChange={(event) => onChange(event.target.value)} onInvalid={(event) => {
            event.preventDefault();
            buttonRef.current?.focus();
          }} required={required} tabIndex={-1} value={normalizedFieldValue}>
          {options.map((option) => (
            <option key={option.id} value={String(option.value)}>{option.label}</option>
          ))}
        </select>
        <div className={cn('flex flex-col relative w-full', {'mt-2': label})}>
          <ListboxButton aria-required={required || undefined} className={selectClasses} id={fieldId} ref={buttonRef}>
            <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 pr-6">
              {selected?.image && <img alt="" className="size-5 shrink-0 rounded-full" src={selected.image} />}
              {selected?.icon && <Svg className="size-5 shrink-0 rounded-full" name={selected.icon} />}
              <span className="block truncate">{selected?.label}&nbsp;</span>
            </span>
            {showChevron ? (
              <ChevronDown
                aria-hidden="true"
                className={chevronClasses}
              />
            ) : null}
          </ListboxButton>

          <ListboxOptions
            className={optionsClasses}
            transition
          >
            {options.map((option) => option && (
              <SelectOption key={option?.id || option?.label} option={option} />
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
};

export const SelectField = memo(SelectFieldComponent);
SelectField.displayName = 'SelectField';
