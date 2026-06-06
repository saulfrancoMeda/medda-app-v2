import { forwardRef, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '@ui/design-system/components/Text';
import { cn } from '@ui/lib/cn';

export interface InputProps extends TextInputProps {
  readonly label?: string;
  readonly error?: string;
  /** Elemento a la derecha (p.ej. botón de mostrar/ocultar contraseña). */
  readonly rightSlot?: ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, rightSlot, className, ...rest }, ref) => (
    <View className="w-full gap-xs">
      {label ? (
        <Text variant="caption" tone="muted">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'h-12 flex-row items-center rounded-md border bg-neutral-100 px-md dark:bg-neutral-800',
          error ? 'border-danger' : 'border-neutral-200 dark:border-neutral-700',
        )}
      >
        <TextInput
          ref={ref}
          placeholderTextColor="#9ca3af"
          className={cn('h-full flex-1 text-body text-neutral-900 dark:text-neutral-50', className)}
          {...rest}
        />
        {rightSlot}
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  ),
);

Input.displayName = 'Input';
