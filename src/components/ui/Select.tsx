import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const selectVariants = cva(
  [
    "w-full",
    "bg-white",
    "border border-gray-200",
    "rounded-xl",
    "text-gray-900",
    "transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
    "appearance-none",
    "cursor-pointer",
  ],
  {
    variants: {
      size: {
        sm: "px-3 py-2 pr-8 text-sm",
        md: "px-4 py-3 pr-10 text-sm",
        lg: "px-5 py-4 pr-12 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message displayed below the select */
  error?: string;
  /** Helper text displayed below the select */
  helperText?: string;
  /** Placeholder option text */
  placeholder?: string;
  /** Array of options */
  options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      size,
      label,
      error,
      helperText,
      placeholder,
      options,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              selectVariants({ size }),
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "w-5 h-5 text-gray-400",
              "pointer-events-none"
            )}
          />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select, selectVariants };
