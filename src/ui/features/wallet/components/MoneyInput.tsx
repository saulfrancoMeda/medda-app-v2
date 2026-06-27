import { maskAmount } from '@domain/shared/money';
import { Input, type InputProps } from '@ui/design-system/components';

interface MoneyInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  readonly value: string;
  readonly onChangeValue: (value: string) => void;
}

export function MoneyInput({ value, onChangeValue, ...rest }: MoneyInputProps) {
  const display = value ? maskAmount((Number(value) * 100).toFixed(0)).display : '';
  return (
    <Input
      leftIcon="cash-outline"
      placeholder="$0.00"
      keyboardType="number-pad"
      value={display}
      onChangeText={(t) => onChangeValue(maskAmount(t).value)}
      {...rest}
    />
  );
}
