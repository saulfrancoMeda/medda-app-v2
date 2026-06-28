import './global.css';

import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@ui/providers/AppProviders';
import { RootNavigator } from '@ui/navigation/RootNavigator';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
