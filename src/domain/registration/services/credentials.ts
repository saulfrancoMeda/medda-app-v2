const PHONE_RE = /^\d{10}$/;
const NIP_RE = /^\d{6}$/;
const OTP_RE = /^\d{6}$/;
const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ.\s]{2,}$/;
const SPECIAL_RE = /[_?@.+#$&]/;
const CURP_RE =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/;

export const isValidPhone = (phone: string): boolean => PHONE_RE.test(phone);
export const isValidOtp = (code: string): boolean => OTP_RE.test(code);
export const isValidNip = (nip: string): boolean => NIP_RE.test(nip);
export const isValidName = (name: string): boolean => NAME_RE.test(name.trim());
export const isValidCurp = (curp: string): boolean => CURP_RE.test(curp.trim().toUpperCase());

export interface PasswordContext {
  readonly phone?: string;
  readonly birthDate?: string;
}

export const validatePassword = (password: string, ctx: PasswordContext = {}): string | null => {
  if (password.length < 8) return 'Usa al menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'Incluye al menos una mayúscula.';
  if (!/[a-z]/.test(password)) return 'Incluye al menos una minúscula.';
  if (!/\d/.test(password)) return 'Incluye al menos un número.';
  if (!SPECIAL_RE.test(password)) return 'Incluye un carácter especial (_ ? @ . + # $ &).';
  if (hasLongRun(password, 3)) return 'No repitas el mismo carácter más de 3 veces seguidas.';
  if (hasSequence(password, 3)) return 'Evita secuencias como "abcd" o "1234".';
  if (/meda/i.test(password)) return 'La contraseña no puede contener "meda".';
  if (ctx.phone && password.includes(ctx.phone))
    return 'La contraseña no puede contener tu teléfono.';
  if (ctx.birthDate && containsBirthDate(password, ctx.birthDate)) {
    return 'La contraseña no puede contener tu fecha de nacimiento.';
  }
  return null;
};

const hasLongRun = (value: string, max: number): boolean => {
  let run = 1;
  for (let i = 1; i < value.length; i++) {
    run = value[i] === value[i - 1] ? run + 1 : 1;
    if (run > max) return true;
  }
  return false;
};

const hasSequence = (value: string, max: number): boolean => {
  let asc = 1;
  let desc = 1;
  for (let i = 1; i < value.length; i++) {
    const delta = value.charCodeAt(i) - value.charCodeAt(i - 1);
    asc = delta === 1 ? asc + 1 : 1;
    desc = delta === -1 ? desc + 1 : 1;
    if (asc > max || desc > max) return true;
  }
  return false;
};

const containsBirthDate = (password: string, birthDate: string): boolean => {
  const match = /(\d{2})\/(\d{2})\/(\d{4})/.exec(birthDate.trim());
  if (!match) return false;
  const [, dd, mm, yyyy] = match;
  if (!dd || !mm || !yyyy) return false;
  const yy = yyyy.slice(2);
  return [`${yyyy}${mm}${dd}`, `${yy}${mm}${dd}`, `${dd}${mm}${yy}`, `${dd}${mm}${yyyy}`].some(
    (form) => password.includes(form),
  );
};

export const isAdult = (birthDate: string, now: Date = new Date()): boolean => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birthDate.trim());
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return false;
  }
  const eighteenth = new Date(Date.UTC(year + 18, month - 1, day));
  return eighteenth.getTime() <= now.getTime();
};
