import { createContext, useContext, useState, type ReactNode } from 'react';
import { createAppContainer, type AppContainer } from '@composition/appContainer';

const ContainerContext = createContext<AppContainer | null>(null);

/** Crea el contenedor de la app UNA sola vez y lo provee a toda la UI (auth + wallet). */
export function ContainerProvider({ children }: { children: ReactNode }) {
  const [container] = useState(createAppContainer);
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer(): AppContainer {
  const ctx = useContext(ContainerContext);
  if (!ctx) {
    throw new Error('useContainer debe usarse dentro de <ContainerProvider>');
  }
  return ctx;
}
