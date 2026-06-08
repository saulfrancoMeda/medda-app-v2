import { forwardRef, useState, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui/design-system/components/Text';
import { cn } from '@ui/lib/cn';

export interface InputProps extends TextInputProps {
  readonly label?: string;
  readonly error?: string;
  /** Ícono a la izquierda (Ionicons), como en el prototipo standalone. */
  readonly leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Elemento a la derecha (p.ej. botón de mostrar/ocultar contraseña). */
  readonly rightSlot?: ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightSlot, className, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    return (
      <View className="w-full gap-xs">
        {label ? (
          <Text variant="caption" tone="muted">
            {label}
          </Text>
        ) : null}
        <View
          style={{ height: 58 }}
          className={cn(
            'flex-row items-center gap-sm rounded-md px-md',
            'border-2 bg-neutral-100 dark:bg-neutral-800',
            error
              ? 'border-danger'
              : focused
                ? 'border-brand-500'
                : 'border-transparent',
          )}
        >
          {leftIcon ? <Ionicons name={leftIcon} size={20} color="#9A9384" /> : null}
          <TextInput
            ref={ref}
            placeholderTextColor="#9A9384"
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
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
    );
  },
);

Input.displayName = 'Input';
