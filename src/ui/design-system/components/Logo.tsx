import { Image, type ImageStyle, type StyleProp } from 'react-native';

const logoSource = require('../../../../assets/brand/logo_meda.png');

export interface LogoProps {
  readonly width?: number;
  readonly height?: number;
  readonly style?: StyleProp<ImageStyle>;
  /** Applies tintColor to the PNG — use `'#FFFFFF'` on dark solid backgrounds so the MEDÁ text stays visible. */
  readonly tint?: string;
}

export function Logo({ width = 120, height = 132, style, tint }: LogoProps) {
  return (
    <Image
      source={logoSource}
      style={[{ width, height, resizeMode: 'contain' }, tint ? { tintColor: tint } : null, style]}
      accessibilityRole="image"
      accessibilityLabel="Medá"
    />
  );
}
