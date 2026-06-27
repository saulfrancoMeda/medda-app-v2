declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type AgentId = Brand<string, 'AgentId'>;
export type ProspectId = Brand<string, 'ProspectId'>;

// Patrón type+constructor con el mismo nombre (companion). Intencional.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AgentId = (value: string): AgentId => value as AgentId;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ProspectId = (value: string): ProspectId => value as ProspectId;
