/**
 * Copyright (c) 2025-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useEffect, useRef, useState} from 'react';

import {TextField} from '../TextField/TextField.js';

import type {ChangeEvent} from 'react';
import type {TextFieldProps} from '../TextField/TextField.js';

export type AutocompleteSuggestion = {
  readonly [key: string]: unknown;
  readonly address?: string;
  readonly city?: string;
  readonly country?: string;
  readonly label?: string;
  readonly latitude?: unknown;
  readonly location?: string;
  readonly longitude?: unknown;
  readonly state?: string;
};

export interface AutocompleteFieldProps<TSuggestion = AutocompleteSuggestion> extends Omit<TextFieldProps, 'onChange' | 'value'> {
  readonly [key: string]: unknown;
  readonly defaultValue?: string;
  readonly getList?: (value: string) => Promise<readonly TSuggestion[]>;
  readonly onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onSelected?: (data: {readonly suggestion: TSuggestion}) => void;
  readonly value?: string;
}

const getSuggestionLabel = (suggestion: AutocompleteSuggestion): string => {
  const directLabel = suggestion.location || suggestion.address || suggestion.label;

  if(directLabel) {
    return String(directLabel);
  }

  return [suggestion.city, suggestion.state, suggestion.country].filter(Boolean).join(', ');
};

export const AutocompleteField = <TSuggestion = AutocompleteSuggestion>({
  defaultValue = '',
  getList,
  label,
  name,
  onChange,
  onSelected,
  placeholder,
  type = 'text',
  value,
  ...props
}: AutocompleteFieldProps<TSuggestion>) => {
  const externalValue = String(value ?? defaultValue ?? '');
  const [query, setQuery] = useState(externalValue);
  const [suggestions, setSuggestions] = useState<readonly TSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const externalValueRef = useRef(externalValue);
  const requestIdRef = useRef(0);
  const selectedQueryRef = useRef('');

  useEffect(() => {
    const nextValue = String(value ?? defaultValue ?? '');

    if(nextValue !== externalValueRef.current) {
      externalValueRef.current = nextValue;
      setQuery(nextValue);
    }
  }, [defaultValue, value]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if(selectedQueryRef.current === query) {
      selectedQueryRef.current = '';
      setIsLoading(false);
      return undefined;
    }

    if(!getList || query.trim().length < 2) {
      setSuggestions((current) => (current.length ? [] : current));
      setIsOpen(false);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    getList(query)
      .then((nextSuggestions) => {
        if(requestIdRef.current !== requestId) {
          return;
        }

        const safeSuggestions = Array.isArray(nextSuggestions) ? nextSuggestions : [];
        setSuggestions(safeSuggestions);
        setIsOpen(safeSuggestions.length > 0);
      })
      .catch(() => {
        if(requestIdRef.current !== requestId) {
          return;
        }

        setSuggestions([]);
        setIsOpen(false);
      })
      .finally(() => {
        if(requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      });
    return () => {
      requestIdRef.current += 1;
    };
  }, [getList, query]);

  const selectSuggestion = (suggestion: TSuggestion) => {
    const nextLabel = getSuggestionLabel(suggestion as AutocompleteSuggestion);
    selectedQueryRef.current = nextLabel;
    setQuery(nextLabel);
    setSuggestions([]);
    setIsOpen(false);
    onSelected?.({suggestion});
  };

  return (
    <div className="app-autocomplete-field">
      <TextField
        {...props}
        autoComplete="off"
        label={label}
        name={name}
        onBlur={(event) => {
          window.setTimeout(() => setIsOpen(false), 120);
          onSelected?.({suggestion: {location: event.currentTarget.value} as TSuggestion});
        }}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          onChange?.(event);
        }}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        placeholder={placeholder}
        type={type}
        value={query}
      />
      {isOpen ? (
        <div className="app-autocomplete-list" role="listbox">
          {suggestions.map((suggestion, index) => {
            const displaySuggestion = suggestion as AutocompleteSuggestion;
            const suggestionLabel = getSuggestionLabel(displaySuggestion);

            return (
              <button
                className="app-autocomplete-option"
                key={`${suggestionLabel}-${index}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSuggestion(suggestion);
                }}
                role="option"
                type="button">
                <span>{suggestionLabel}</span>
                {displaySuggestion.latitude && displaySuggestion.longitude ? (
                  <small>{Number(displaySuggestion.latitude).toFixed(3)}, {Number(displaySuggestion.longitude).toFixed(3)}</small>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {isLoading ? <span className="app-autocomplete-status">Searching...</span> : null}
    </div>
  );
};
