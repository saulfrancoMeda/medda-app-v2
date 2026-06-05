import { forwardRef } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@ui/lib/cn';

const text = cva('text-neutral-900', {
  variants: {
    variant: {
      display: 'text-display font-bold',
      h1: 'text-h1 font-bold',
      h2: 'text-h2 font-semibold',
      body: 'text-body',
      caption: 'text-caption text-neutral-500',
    },
    tone: {
      default: '',
      muted: 'text-neutral-500',
      brand: 'text-brand-600',
      danger: 'text-danger',
      inverse: 'text-neutral-0',
    },
    center: { true: 'text-center' },
  },
  defaultVariants: { variant: 'body', tone: 'default' },
});

type TextVariants = VariantProps<typeof text>;

export interface TextProps extends RNTextProps, TextVariants {}

export const Text = forwardRef<RNText, TextProps>(
  ({ variant, tone, center, className, ...rest }, ref) => (
    <RNText ref={ref} className={cn(text({ variant, tone, center }), className)} {...rest} />
  ),
);

Text.displayName = 'Text';
