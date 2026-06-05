import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from '@ui/design-system/components/Text';
import { cn } from '@ui/lib/cn';

const button = cva('flex-row items-center justify-center gap-sm rounded-pill', {
  variants: {
    variant: {
      solid: 'bg-brand-500',
      outline: 'border border-brand-500 bg-transparent',
      ghost: 'bg-transparent',
      link: 'bg-transparent px-none',
    },
    size: {
      sm: 'h-9 px-md',
      md: 'h-12 px-lg',
      lg: 'h-14 px-xl',
    },
    disabled: { true: 'opacity-40' },
    full: { true: 'w-full' },
  },
  defaultVariants: { variant: 'solid', size: 'md' },
});

const label = cva('font-semibold', {
  variants: {
    variant: {
      solid: 'text-neutral-0',
      outline: 'text-brand-600',
      ghost: 'text-brand-600',
      link: 'text-brand-600 underline',
    },
  },
  defaultVariants: { variant: 'solid' },
});

type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps
  extends
    Omit<PressableProps, 'disabled' | 'children'>,
    Pick<ButtonVariants, 'variant' | 'size' | 'full'> {
  readonly title: string;
  readonly loading?: boolean;
  readonly disabled?: boolean;
}

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant, size, full, loading = false, disabled = false, className, ...rest }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        className={cn(button({ variant, size, full, disabled: isDisabled }), className)}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'solid' || !variant ? '#ffffff' : '#0a7d5d'} />
        ) : (
          <Text className={label({ variant })}>{title}</Text>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';
