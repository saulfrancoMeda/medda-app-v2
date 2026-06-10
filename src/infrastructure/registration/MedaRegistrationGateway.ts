import { err, ok, type Result } from '@domain/shared/result';
import type { RegistrationDraft } from '@domain/registration/entities/Registration';
import type {
  CatalogItem,
  DocumentImage,
  DocumentRequirement,
  OcrResult,
  RegistrationError,
  RegistrationGateway,
  TransactionalQuestion,
} from '@domain/registration/ports/RegistrationGateway';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { documentDataExtractEndpoint, endpoints } from '@infrastructure/http/endpoints';

const toError = (e: HttpError): RegistrationError => {
  if (e.kind === 'network') return { type: 'network' };
  return { type: 'unknown', message: e.message };
};

const parseCatalog = (value: unknown): CatalogItem[] => {
  const record = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  const wrapper = record(value);
  const container = wrapper
    ? (wrapper.occupations ?? wrapper.catalogs ?? wrapper.data ?? wrapper)
    : value;

  if (Array.isArray(container)) {
    return container.map((item) => {
      const o = record(item);
      if (!o) return { key: String(item), label: String(item) };
      const key = o.key ?? o.id ?? o.value ?? '';
      const label = o.value ?? o.name ?? o.label ?? o.description ?? key;
      return { key: String(key), label: String(label) };
    });
  }
  const map = record(container);
  if (map) {
    return Object.entries(map).map(([key, label]) => ({ key, label: String(label) }));
  }
  return [];
};

const isFilePart = (value: unknown): value is DocumentImage =>
  typeof value === 'object' &&
  value !== null &&
  'uri' in value &&
  'name' in value &&
  'type' in value;

const buildFormData = (form: FormData, data: unknown, parentKey?: string): void => {
  if (Array.isArray(data)) {
    data.forEach((item, index) =>
      buildFormData(form, item, parentKey ? `${parentKey}[${index}]` : String(index)),
    );
    return;
  }
  if (isFilePart(data)) {
    form.append(parentKey ?? 'file', data as unknown as Blob);
    return;
  }
  if (data && typeof data === 'object') {
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) =>
      buildFormData(form, value, parentKey ? `${parentKey}[${key}]` : key),
    );
    return;
  }
  const value = typeof data === 'boolean' ? (data ? 1 : 0) : (data ?? '');
  form.append(parentKey ?? '', String(value));
};

export class MedaRegistrationGateway implements RegistrationGateway {
  constructor(private readonly http: HttpClient) { }

  async isPhoneAvailable(phone: string): Promise<Result<true, RegistrationError>> {
    const res = await this.http.request<{ user?: string }>(endpoints.getUserName, {
      query: { cellphone: phone },
      silentStatuses: [404],
    });
    if (res.ok) {
      return res.value.user ? err({ type: 'phone_taken' }) : ok(true);
    }
    if (res.error.status === 404) return ok(true);
    if (res.error.kind === 'network') return err({ type: 'network' });
    return err({ type: 'unknown', message: res.error.message });
  }

  async sendVerificationCode(phone: string): Promise<Result<true, RegistrationError>> {
    const res = await this.http.request<unknown>(endpoints.phoneSendCode, {
      body: { phone, validate: 1 },
    });
    if (!res.ok) return err(toError(res.error));
    return ok(true);
  }

  async validateVerificationCode(
    phone: string,
    code: string,
  ): Promise<Result<true, RegistrationError>> {
    const res = await this.http.request<unknown>(endpoints.validateCode, {
      body: { code, phone, omitUserValidation: 1 },
    });
    if (!res.ok) {
      if (res.error.kind === 'network') return err({ type: 'network' });
      return err({ type: 'invalid_code' });
    }
    return ok(true);
  }

  async getRequiredDocuments(
    nationality: string,
    resident: string,
  ): Promise<Result<DocumentRequirement, RegistrationError>> {
    const res = await this.http.request<{
      requiredDocuments?: { type?: string; documentId?: string | number; requiresBack?: boolean };
    }>(endpoints.documentsRequired, { body: { nationality, resident } });
    if (!res.ok) return err(toError(res.error));
    const raw = res.value.requiredDocuments ?? {};
    return ok({
      documentId: raw.documentId !== undefined ? String(raw.documentId) : '',
      type: raw.type ?? 'ine',
      requiresBack: raw.requiresBack ?? true,
    });
  }

  async extractDocumentData(
    documentId: string,
    image: DocumentImage,
  ): Promise<Result<OcrResult, RegistrationError>> {
    const form = new FormData();
    form.append('file', image as unknown as Blob);
    const res = await this.http.request<Record<string, unknown>>(
      documentDataExtractEndpoint(documentId),
      { body: form },
    );
    if (!res.ok) return err(toError(res.error));
    const raw = res.value;
    const str = (value: unknown): string | undefined =>
      typeof value === 'string' && value.length > 0 ? value : undefined;
    return ok({
      curp: str(raw.curp),
      firstName: str(raw.nome ?? raw.firstName ?? raw.nombre),
      lastName: str(raw.apellido ?? raw.lastName ?? raw.apellidoPaterno),
      lastName2: str(raw.lastName2 ?? raw.apellidoMaterno),
      birthDate: str(raw.birthDate ?? raw.fechaNacimiento),
    });
  }


  async getTransactionalProfileQuestions(): Promise<
    Result<readonly TransactionalQuestion[], RegistrationError>
  > {
    const res = await this.http.request<{
      questions?: Record<string, string>;
      options?: Record<string, Record<string, string>>;
    }>(endpoints.transactionalProfileQuestions);
    if (!res.ok) return err(toError(res.error));
    const questions = res.value.questions ?? {};
    const options = res.value.options ?? {};
    return ok(
      Object.entries(questions).map(([key, text]) => ({
        key,
        text,
        options: Object.entries(options[key] ?? {}).map(([label, value]) => ({
          label,
          value: String(value),
        })),
      })),
    );
  }

  async getOccupations(): Promise<Result<readonly CatalogItem[], RegistrationError>> {
    const res = await this.http.request<unknown>(endpoints.occupations);
    if (!res.ok) return err(toError(res.error));
    return ok(parseCatalog(res.value));
  }

  async register(draft: RegistrationDraft): Promise<Result<true, RegistrationError>> {
    const blackList = await this.blackListSign(draft);
    if (!blackList.ok) return err(blackList.error);

    const hasDocuments = Boolean(draft.documentFrontUri);
    const data: Record<string, unknown> = {
      cellphone: draft.phone,
      phone: draft.phone,
      firstName: draft.firstName,
      lastName: draft.lastName,
      lastName2: draft.lastName2,
      password: draft.password,
      nip: draft.nip,
      nipSignature: draft.nip,
      birthDate: draft.birthDate,
      occupation: draft.occupation,
      genre: draft.gender === 'Masculino' ? 'M' : 'F',
      nationality: draft.nationality === 'mexicana' ? 'mx' : 'ext',
      curp: draft.curp,
      resident: draft.resident === 'fm',
      latitude: draft.latitude || '0.0',
      longitude: draft.longitude || '0.0',
      documentsDeliveryWay: hasDocuments ? 'app' : 'external',
      email: draft.email,
      sellProductsOrServicesInHome: draft.sellsFromHome ?? false,
      blackListValidationSign: blackList.sign,
      homeAddress: {
        street: draft.address.street,
        colony: draft.address.colony,
        municipality: draft.address.municipality,
        state: draft.address.state,
        colonySelected: draft.address.colonySelected,
        postalCode: draft.address.postalCode,
        extNumber: draft.address.extNumber,
        intNumber: draft.address.intNumber,
      },
      beneficiaries: draft.beneficiaries.map((b) => ({
        firstName: b.firstName,
        lastName: b.lastName,
        lastName2: b.lastName2,
        secondLastName: b.lastName2,
        percent: b.percent,
      })),
      goalsSurvey: draft.transactionalProfile,
      additionalData: {
        isPep: false,
        noticeOfPrivacyCheck: draft.acceptedPrivacy,
      },
    };

    if (!hasDocuments) {
      const res = await this.http.request<unknown>(endpoints.register, { body: data });
      return res.ok ? ok(true) : err(toError(res.error));
    }

    const files: unknown[] = [
      {
        document: draft.documentType || 'ine',
        file: { uri: draft.documentFrontUri, name: 'id_front.jpg', type: 'image/jpeg' },
      },
    ];
    if (draft.documentBackUri) {
      files.push({
        document: draft.documentType || 'ine',
        file: { uri: draft.documentBackUri, name: 'id_back.jpg', type: 'image/jpeg' },
      });
    }
    const form = new FormData();
    buildFormData(form, { ...data, files });
    const res = await this.http.request<unknown>(endpoints.register, { body: form });
    return res.ok ? ok(true) : err(toError(res.error));
  }

  private async blackListSign(
    draft: RegistrationDraft,
  ): Promise<{ ok: true; sign: unknown } | { ok: false; error: RegistrationError }> {
    const res = await this.http.request<{ validationSign?: unknown }>(endpoints.blackListCheck, {
      body: {
        cellphone: draft.phone,
        firstName: draft.firstName,
        lastName: draft.lastName,
        lastName2: draft.lastName2,
      },
    });
    if (res.ok) return { ok: true, sign: res.value.validationSign ?? null };
    if (res.error.kind === 'network') return { ok: false, error: { type: 'network' } };
    return { ok: true, sign: null };
  }
}
