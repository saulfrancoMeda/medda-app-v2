import { err, ok, type Result } from '@domain/shared/result';
import type { FaqItem } from '@domain/support/entities/Faq';
import type { SupportError, SupportRepository } from '@domain/support/ports/SupportRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';

interface RawFaq {
  id?: string;
  question?: string;
  response?: string;
  tags?: string[];
  category?: { name?: string };
}

export class MedaSupportRepository implements SupportRepository {
  constructor(private readonly http: HttpClient) {}

  async getFaqs(): Promise<Result<readonly FaqItem[], SupportError>> {
    const res = await this.http.request<{ faqs?: RawFaq[] }>(endpoints.faqs);
    if (!res.ok) {
      return err(
        res.error.kind === 'network'
          ? { type: 'network' }
          : { type: 'unknown', message: res.error.message },
      );
    }
    const faqs: FaqItem[] = (res.value.faqs ?? []).map((f) => ({
      id: f.id ?? '',
      question: f.question ?? '',
      response: f.response ?? '',
      tags: f.tags ?? [],
      category: f.category?.name,
    }));
    return ok(faqs);
  }
}
