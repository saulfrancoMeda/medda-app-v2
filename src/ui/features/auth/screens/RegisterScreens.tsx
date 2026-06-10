import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  isValidName,
  isValidNip,
  isValidOtp,
  isValidPhone,
  validatePassword,
} from '@domain/registration/services/credentials';
import { Button, Input, Text } from '@ui/design-system/components';
import { registrationErrorMessage } from '@ui/features/auth/authMessages';
import { useRegistration } from '@ui/features/registration/RegistrationProvider';
import { useResendCooldown } from '@ui/features/registration/hooks/useResendCooldown';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { AuthStackParamList } from '@ui/navigation/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Step 1: collect the phone, confirm it has no account yet, and send the SMS code.
type PhoneProps = NativeStackScreenProps<AuthStackParamList, 'RegisterPhone'>;
export function RegisterPhoneScreen({ navigation }: PhoneProps) {
  const { checkPhoneAvailable, sendVerificationCode } = useContainer();
  const { draft, update } = useRegistration();
  const toast = useToast();
  const [phone, setPhone] = useState(draft.phone);
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (!isValidPhone(phone)) return;
    setLoading(true);
    const available = await checkPhoneAvailable(phone);
    if (!available.ok) {
      setLoading(false);
      toast.error(registrationErrorMessage(available.error));
      return;
    }
    const sent = await sendVerificationCode(phone);
    setLoading(false);
    if (!sent.ok) {
      toast.error(registrationErrorMessage(sent.error));
      return;
    }
    update({ phone, phoneVerified: false, currentStep: 'otp' });
    navigation.navigate('RegisterOtp');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <View className="flex-1 px-lg pt-xl">
        <View className="gap-xs">
          <Text variant="h1">Crea tu cuenta</Text>
          <Text variant="body" tone="muted">
            Ingresa tu número de celular. Te enviaremos un código por SMS para verificarlo.
          </Text>
        </View>
        <View className="pt-xl">
          <Input
            label="Número de celular"
            placeholder="10 dígitos"
            leftIcon="call-outline"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          />
        </View>
        <View className="flex-1" />
        <Button
          title="Continuar"
          full
          loading={loading}
          disabled={!isValidPhone(phone)}
          onPress={onContinue}
          className="mb-lg"
        />
      </View>
    </SafeAreaView>
  );
}

// Step 2: validate the SMS code. Resend is rate-limited with a 60s cooldown.
const RESEND_COOLDOWN_SECONDS = 60;
type OtpProps = NativeStackScreenProps<AuthStackParamList, 'RegisterOtp'>;
export function RegisterOtpScreen({ navigation }: OtpProps) {
  const { sendVerificationCode, validateVerificationCode } = useContainer();
  const { draft, update } = useRegistration();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { secondsLeft, isCoolingDown, start } = useResendCooldown(RESEND_COOLDOWN_SECONDS);

  // A code was just sent when we arrive here, so begin the cooldown immediately.
  useEffect(() => {
    start();
  }, [start]);

  const onValidate = async () => {
    if (!isValidOtp(code)) return;
    setLoading(true);
    const res = await validateVerificationCode(draft.phone, code);
    setLoading(false);
    if (!res.ok) {
      toast.error(registrationErrorMessage(res.error));
      return;
    }
    update({ phoneVerified: true, currentStep: 'personal' });
    navigation.navigate('RegisterPersonal');
  };

  const onResend = async () => {
    if (isCoolingDown || resending) return;
    setResending(true);
    const res = await sendVerificationCode(draft.phone);
    setResending(false);
    if (!res.ok) {
      toast.error(registrationErrorMessage(res.error));
      return;
    }
    start();
    toast.success('Te reenviamos el código por SMS.');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <View className="flex-1 px-lg pt-xl">
        <View className="gap-xs">
          <Text variant="h1">Verifica tu número</Text>
          <Text variant="body" tone="muted">
            Escribe el código de 6 dígitos que enviamos por SMS al {draft.phone}.
          </Text>
        </View>
        <View className="pt-xl">
          <Input
            label="Código"
            placeholder="6 dígitos"
            leftIcon="keypad-outline"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
          />
        </View>
        <View className="pt-lg">
          <Button
            title={isCoolingDown ? `Reenviar código en ${secondsLeft}s` : 'Reenviar código'}
            variant="ghost"
            loading={resending}
            disabled={isCoolingDown}
            onPress={onResend}
          />
        </View>
        <View className="flex-1" />
        <Button
          title="Verificar"
          full
          loading={loading}
          disabled={!isValidOtp(code)}
          onPress={onValidate}
          className="mb-lg"
        />
      </View>
    </SafeAreaView>
  );
}

// Step 3: personal data + password (validated live against the legacy rules).
type PersonalProps = NativeStackScreenProps<AuthStackParamList, 'RegisterPersonal'>;
export function RegisterPersonalScreen({ navigation }: PersonalProps) {
  const { draft, update } = useRegistration();
  const [firstName, setFirstName] = useState(draft.firstName);
  const [lastName, setLastName] = useState(draft.lastName);
  const [lastName2, setLastName2] = useState(draft.lastName2);
  const [email, setEmail] = useState(draft.email);
  const [password, setPassword] = useState(draft.password);
  const [confirm, setConfirm] = useState(draft.password);

  const passwordError = password
    ? validatePassword(password, { phone: draft.phone, birthDate: draft.birthDate })
    : null;
  const emailValid = EMAIL_RE.test(email);
  const valid =
    isValidName(firstName) &&
    isValidName(lastName) &&
    emailValid &&
    !passwordError &&
    password.length > 0 &&
    password === confirm;

  const onContinue = () => {
    if (!valid) return;
    update({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      lastName2: lastName2.trim(),
      email: email.trim(),
      password,
      currentStep: 'nip',
    });
    navigation.navigate('RegisterNip');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-md p-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs pb-sm">
          <Text variant="h1">Tus datos</Text>
          <Text variant="body" tone="muted">
            Completa tu información para crear tu cuenta.
          </Text>
        </View>
        <Input
          label="Nombre(s)"
          leftIcon="person-outline"
          placeholder="Nombre"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Input
          label="Apellido paterno"
          placeholder="Apellido paterno"
          value={lastName}
          onChangeText={setLastName}
        />
        <Input
          label="Apellido materno (opcional)"
          placeholder="Apellido materno"
          value={lastName2}
          onChangeText={setLastName2}
        />
        <Input
          label="Correo electrónico"
          leftIcon="mail-outline"
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={email.length > 0 && !emailValid ? 'Correo inválido' : undefined}
        />
        <Input
          label="Contraseña"
          leftIcon="lock-closed-outline"
          placeholder="Crea una contraseña segura"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={passwordError ?? undefined}
        />
        <Input
          label="Confirmar contraseña"
          leftIcon="lock-closed-outline"
          placeholder="Repite tu contraseña"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          error={confirm.length > 0 && confirm !== password ? 'No coincide' : undefined}
        />
        <Button title="Continuar" full disabled={!valid} onPress={onContinue} className="mt-sm" />
      </ScrollView>
    </SafeAreaView>
  );
}

// Step 4: transactional NIP (6 digits, confirmed).
type NipProps = NativeStackScreenProps<AuthStackParamList, 'RegisterNip'>;
export function RegisterNipScreen({ navigation }: NipProps) {
  const { draft, update } = useRegistration();
  const [nip, setNip] = useState(draft.nip);
  const [confirm, setConfirm] = useState('');
  const valid = isValidNip(nip) && nip === confirm;

  const onContinue = () => {
    if (!valid) return;
    update({ nip, currentStep: 'legal' });
    navigation.navigate('RegisterLegal');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <View className="flex-1 px-lg pt-xl">
        <View className="gap-xs">
          <Text variant="h1">Crea tu NIP</Text>
          <Text variant="body" tone="muted">
            Tu NIP de 6 dígitos autoriza tus operaciones. No lo compartas con nadie.
          </Text>
        </View>
        <View className="gap-md pt-xl">
          <Input
            label="NIP"
            leftIcon="keypad-outline"
            placeholder="6 dígitos"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={nip}
            onChangeText={(t) => setNip(t.replace(/[^0-9]/g, ''))}
          />
          <Input
            label="Confirma tu NIP"
            leftIcon="keypad-outline"
            placeholder="6 dígitos"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={confirm}
            onChangeText={(t) => setConfirm(t.replace(/[^0-9]/g, ''))}
            error={confirm.length === 6 && confirm !== nip ? 'El NIP no coincide' : undefined}
          />
        </View>
        <View className="flex-1" />
        <Button title="Continuar" full disabled={!valid} onPress={onContinue} className="mb-lg" />
      </View>
    </SafeAreaView>
  );
}

function CheckRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-start gap-sm py-sm"
    >
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={24}
        color={checked ? '#97720A' : '#9A9384'}
      />
      <Text variant="body" className="flex-1">
        {label}
      </Text>
    </Pressable>
  );
}

// Step 5: legal acceptance + final account creation.
type LegalProps = NativeStackScreenProps<AuthStackParamList, 'RegisterLegal'>;
export function RegisterLegalScreen({ navigation }: LegalProps) {
  const { register } = useContainer();
  const { draft, update, reset } = useRegistration();
  const toast = useToast();
  const [terms, setTerms] = useState(draft.acceptedTerms);
  const [privacy, setPrivacy] = useState(draft.acceptedPrivacy);
  const [opening, setOpening] = useState(draft.acceptedAccountOpening);
  const [loading, setLoading] = useState(false);
  const valid = terms && privacy && opening;

  const onCreate = async () => {
    if (!valid) return;
    update({ acceptedTerms: terms, acceptedPrivacy: privacy, acceptedAccountOpening: opening });
    setLoading(true);
    const res = await register({
      ...draft,
      acceptedTerms: terms,
      acceptedPrivacy: privacy,
      acceptedAccountOpening: opening,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(registrationErrorMessage(res.error));
      return;
    }
    reset();
    toast.success('¡Cuenta creada! Inicia sesión con tu número y contraseña.');
    navigation.popToTop();
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-sm p-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs pb-sm">
          <Text variant="h1">Últimos detalles</Text>
          <Text variant="body" tone="muted">
            Para crear tu cuenta necesitamos tu consentimiento.
          </Text>
        </View>
        <CheckRow
          checked={terms}
          onToggle={() => setTerms((v) => !v)}
          label="He leído y acepto los Términos y Condiciones de uso."
        />
        <CheckRow
          checked={privacy}
          onToggle={() => setPrivacy((v) => !v)}
          label="He leído y acepto el Aviso de Privacidad."
        />
        <CheckRow
          checked={opening}
          onToggle={() => setOpening((v) => !v)}
          label="Acepto la apertura de mi cuenta con Medá, Institución de Fondos de Pago Electrónico."
        />
        <Button
          title="Crear cuenta"
          full
          loading={loading}
          disabled={!valid}
          onPress={onCreate}
          className="mt-md"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
