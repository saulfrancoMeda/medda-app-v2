import { forwardRef, useState, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui/design-system/components/Text';
import { cn } from '@ui/lib/cn';
import { palette } from '@ui/design-system/tokens/palette';

export interface InputProps extends TextInputProps {
  readonly label?: string;
  readonly error?: string;
  readonly leftIcon?: keyof typeof Ionicons.glyphMap;
  readonly rightSlot?: ReactNode;
}

const BORDER_REST = 'transparent';
const BORDER_FOCUS = palette.brand[500];
const BORDER_ERROR = palette.danger;

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightSlot, className, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const borderColor = error ? BORDER_ERROR : focused ? BORDER_FOCUS : BORDER_REST;
    return (
      <View className="w-full gap-sm">
        {label ? (
          <Text variant="caption" tone="muted" className="font-medium">
            {label}
          </Text>
        ) : null}
        <View
          style={{ height: 56, borderColor, borderWidth: 2 }}
          className="flex-row items-center gap-sm rounded-md bg-neutral-100 px-md dark:bg-neutral-800"
        >
          {leftIcon ? (
            <Ionicons name={leftIcon} size={20} color={focused ? palette.brand[700] : palette.neutral[400]} />
          ) : null}
          <TextInput
            ref={ref}
            placeholderTextColor={palette.neutral[400]}
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
