import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from '@ui/design-system/components/Text';
import { cn } from '@ui/lib/cn';
import { palette } from '@ui/design-system/tokens/palette';

const button = cva('flex-row items-center justify-center gap-sm rounded-pill', {
  variants: {
    variant: {
      solid: 'bg-brand-500',
      soft: 'bg-brand-100',
      outline: 'border border-brand-500 bg-transparent',
      ghost: 'bg-transparent',
      link: 'bg-transparent px-none',
    },
    size: {
      sm: 'h-10 px-md',
      md: 'h-14 px-lg',
      lg: 'h-14 px-xl',
    },
    disabled: { true: '' },
    full: { true: 'w-full' },
  },
  compoundVariants: [
    { variant: 'solid', disabled: true, class: 'bg-brand-100' },
    { variant: ['soft', 'outline', 'ghost', 'link'], disabled: true, class: 'opacity-40' },
  ],
  defaultVariants: { variant: 'solid', size: 'md' },
});

type ButtonVariants = VariantProps<typeof button>;

const labelTone = (variant: ButtonProps['variant'], disabled: boolean) => {
  if (disabled && (variant === 'solid' || !variant)) return 'muted' as const;
  return variant === 'outline' || variant === 'ghost' || variant === 'link'
    ? ('brand' as const)
    : ('default' as const);
};

export interface ButtonProps
  extends Omit<PressableProps, 'disabled' | 'children'>,
  Pick<ButtonVariants, 'variant' | 'size' | 'full'> {
  readonly title: string;
  readonly loading?: boolean;
  readonly disabled?: boolean;
}

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant, size, full, loading = false, disabled = false, className, ...rest }, ref) => {
    const isDisabled = disabled || loading;
    const isSolid = variant === 'solid' || variant === 'soft' || !variant;
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        android_ripple={
          isDisabled || variant === 'link'
            ? undefined
            : { color: 'rgba(0,0,0,0.10)', borderless: false }
        }
        style={({ pressed }) => (pressed && !isDisabled ? { opacity: 0.85 } : undefined)}
        className={cn(button({ variant, size, full, disabled: isDisabled }), className)}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={isSolid ? palette.neutral[900] : palette.brand[500]} />
        ) : (
          <Text
            tone={labelTone(variant, isDisabled)}
            className={cn('font-semibold', variant === 'link' && 'underline')}
          >
            {title}
          </Text>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';
