import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface GoldGradientProps extends ViewProps {
  readonly radius?: number;
  readonly children?: ReactNode;
}

/**
 * Fondo con gradiente dorado diagonal (goldBright -> gold -> goldPress) + un brillo diagonal
 * sutil, paridad con la tarjeta de saldo del prototipo standalone. Usa react-native-svg con
 * `absoluteFill` (cubre TODO el contenedor, sin importar su altura automática) y `backgroundColor`
 * dorado de respaldo. Las esquinas se redondean con overflow:hidden + borderRadius.
 */
export function GoldGradient({ radius = 26, style, children, ...rest }: GoldGradientProps) {
  return (
    <View
      style={[{ borderRadius: radius, backgroundColor: '#FCD535', overflow: 'hidden' }, style]}
      {...rest}
    >
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="goldFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFE268" />
            <Stop offset="0.55" stopColor="#FCD535" />
            <Stop offset="1" stopColor="#EAC11C" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#goldFill)" />
      </Svg>
      {children}
    </View>
  );
}
