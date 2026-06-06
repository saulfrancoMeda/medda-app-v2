import { Image, type ImageStyle, type StyleProp } from 'react-native';

// Logo oficial de Medá (dorado "M MEDÁ"). Asset real tomado del legacy (app/assets/logo_meda.png).
const logoSource = require('../../../../assets/brand/logo_meda.png');

export interface LogoProps {
  readonly width?: number;
  readonly height?: number;
  readonly style?: StyleProp<ImageStyle>;
}

export function Logo({ width = 120, height = 132, style }: LogoProps) {
  return (
    <Image
      source={logoSource}
      style={[{ width, height, resizeMode: 'contain' }, style]}
      accessibilityRole="image"
      accessibilityLabel="Medá"
    />
  );
}
