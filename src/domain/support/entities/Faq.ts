/** Pregunta frecuente (/public/agents/faqs). `response` es HTML. */
export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly response: string;
  readonly tags: readonly string[];
  readonly category?: string;
}
