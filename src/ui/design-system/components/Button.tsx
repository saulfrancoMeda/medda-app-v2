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

type ButtonVariants = VariantProps<typeof button>;

// El color del label se decide vía el `tone` del Text (fuente única de color), no por className.
// solid (fondo dorado) -> texto oscuro; outline/ghost/link -> texto dorado.
const labelTone = (variant: ButtonProps['variant']) =>
  variant === 'outline' || variant === 'ghost' || variant === 'link' ? 'brand' : 'default';

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
    const isSolid = variant === 'solid' || !variant;
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
          <ActivityIndicator color={isSolid ? '#060612' : '#fcd535'} />
        ) : (
          <Text
            tone={labelTone(variant)}
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
