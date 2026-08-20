import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const selectVariants = cva(
  [
    // v4: a ruled field on the dark ground — see `.field` in globals.css.
    "field",
  ],
  {
    variants: {
      // TYPE SIZE only. `.field` owns the padding and the underline, so
      // these no longer change the control's box (Phase 4/5 review).
      size: {
        sm: "text-sm",
        md: "text-[15px]",
        lg: "text-base",
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
            className="field-label"
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
              error && "border-b-red-400 focus:border-b-red-400",
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
              "w-5 h-5 text-chalk-dim",
              "pointer-events-none"
            )}
          />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-2 text-sm text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-2 text-sm text-chalk-dim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select, selectVariants };
