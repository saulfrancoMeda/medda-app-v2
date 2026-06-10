const DOCS = 'https://meda.com.mx/docs';
const SECTION = 'https://meda.com.mx/terms-and-conditions?section=';

export type LegalKind = 'pdf' | 'web' | 'external';

export interface LegalDocument {
  readonly id: string;
  readonly title: string;
  readonly kind: LegalKind;
  readonly url: string;
}

export const legalDocuments: readonly LegalDocument[] = [
  {
    id: 'terms',
    title: 'Términos y Condiciones',
    kind: 'pdf',
    url: `${DOCS}/billetera_meda/anexo_a.pdf`,
  },
  {
    id: 'terms-empresarial-meda',
    title: 'Términos y Condiciones Billetera Empresarial Medá',
    kind: 'pdf',
    url: `${DOCS}/billetera_empresarial_meda/anexo_a.pdf`,
  },
  {
    id: 'terms-empresarial-integral',
    title: 'Términos y Condiciones Billetera Empresarial Integral',
    kind: 'pdf',
    url: `${DOCS}/billetera_empresarial_integral/anexo_a.pdf`,
  },
  {
    id: 'terms-mi-integral',
    title: 'Términos y Condiciones Mi Billetera Medá Integral',
    kind: 'pdf',
    url: `${DOCS}/mi_billetera_meda_integral/anexo_a.pdf`,
  },
  {
    id: 'terms-pb',
    title: 'Términos y Condiciones Mi Billetera PB',
    kind: 'pdf',
    url: `${DOCS}/billetera_pb/anexo_a.pdf`,
  },
  {
    id: 'privacy',
    title: 'Aviso de privacidad',
    kind: 'pdf',
    url: `${DOCS}/aviso_privacidad/aviso_privacidad.pdf`,
  },
  { id: 'notices', title: 'Avisos', kind: 'web', url: `${SECTION}notices` },

  { id: 'costs', title: 'Costos y Comisiones', kind: 'web', url: `${SECTION}costsAndCommissions` },
  {
    id: 'adhesion',
    title: 'Contrato de Adhesión Medá',
    kind: 'web',
    url: `${SECTION}adhesionContract`,
  },
];

export const legalLinks: readonly LegalDocument[] = [
  { id: 'condusef', title: 'CONDUSEF', kind: 'external', url: 'https://www.condusef.gob.mx/' },
  {
    id: 'buro',
    title: 'Buró de entidades financieras',
    kind: 'external',
    url: 'https://www.buro.gob.mx/general_gob.php?id_sector=66&id_periodo=44',
  },
];
