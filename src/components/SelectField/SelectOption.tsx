import {ListboxOption} from '@headlessui/react';
import {Check} from 'lucide-react';
import {memo} from 'react';

import {Svg} from '../Svg/Svg.js';

export type SelectFieldOption = {
  readonly icon?: string;
  readonly id?: number | string;
  readonly image?: string;
  readonly label: string;
  readonly value: string | number | boolean;
};

export type SelectOptionProps = {
  readonly option: SelectFieldOption;
};
const SelectOptionComponent = ({option}: SelectOptionProps) => (
  <ListboxOption
    className="group relative cursor-pointer disabled:cursor-not-allowed py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
    key={option.id || option.label}
    value={String(option.value)}
  >
    <div className="flex items-center">
      {option.icon && <Svg className="size-5 shrink-0 rounded-full" name={option.icon} />}
      {option.image && <img alt="" className="size-5 shrink-0 rounded-full" src={option.image} />}
      <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">{option.label}</span>
    </div>

    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
      <Check aria-hidden="true" className="size-5" />
    </span>
  </ListboxOption>
);

export const SelectOption = memo(SelectOptionComponent);
SelectOption.displayName = 'SelectOption';
