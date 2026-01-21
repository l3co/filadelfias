import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Selecione...',
  required = false,
  disabled = false,
  className,
  error,
}: FormSelectProps<T>) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && 'border-destructive')}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// Native select for forms that use register (react-hook-form)
interface NativeSelectProps {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  // Spread remaining props for register
  [key: string]: unknown;
}

export function NativeSelect({
  label,
  options,
  placeholder = 'Selecione...',
  required = false,
  disabled = false,
  className,
  error,
  ...registerProps
}: NativeSelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <select
        {...registerProps}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
          error ? 'border-destructive' : 'border-gray-200',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
