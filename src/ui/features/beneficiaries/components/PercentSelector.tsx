import { Pressable, View } from 'react-native';
import {
  BENEFICIARY_PERCENT_OPTIONS,
  type BeneficiaryPercent,
} from '@domain/beneficiaries/entities/Beneficiary';
import { Text } from '@ui/design-system/components';
import { cn } from '@ui/lib/cn';

interface PercentSelectorProps {
  readonly value: number | null;
  readonly onSelect: (percent: BeneficiaryPercent) => void;
  readonly maxPercent: number;
  readonly allowHundred: boolean;
  readonly error?: string;
}

const OPTIONS = [...BENEFICIARY_PERCENT_OPTIONS].sort((a, b) => a - b);

export function PercentSelector({
  value,
  onSelect,
  maxPercent,
  allowHundred,
  error,
}: PercentSelectorProps) {
  return (
    <View className="w-full gap-sm">
      <Text variant="caption" tone="muted" className="font-medium">
        Porcentaje
      </Text>
      <View className="flex-row gap-sm">
        {OPTIONS.map((option) => {
          const selected = value === option;
          const disabled = !selected && (option > maxPercent || (option === 100 && !allowHundred));
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onSelect(option)}
              style={{ height: 48 }}
              className={cn(
                'flex-1 items-center justify-center rounded-md border-2',
                selected
                  ? 'border-brand-500 bg-brand-100'
                  : 'border-transparent bg-neutral-100 dark:bg-neutral-800',
                disabled && 'opacity-40',
              )}
            >
              <Text variant="body" tone={selected ? 'brand' : 'default'} className="font-semibold">
                {option}%
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
