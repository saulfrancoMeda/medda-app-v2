import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  isAdult,
  isValidCurp,
  isValidName,
  isValidNip,
  isValidOtp,
  isValidPhone,
  validatePassword,
} from '@domain/registration/services/credentials';
import type {
  Nationality,
  RegistrationBeneficiary,
  ResidentStatus,
} from '@domain/registration/entities/Registration';
import type { BeneficiaryPercent } from '@domain/beneficiaries/entities/Beneficiary';
import type {
  CatalogItem,
  TransactionalQuestion,
} from '@domain/registration/ports/RegistrationGateway';

import { Button, Input, Text, type InputProps } from '@ui/design-system/components';
import { cn } from '@ui/lib/cn';
import { ColonyPicker } from '@ui/features/beneficiaries/components/ColonyPicker';
import { PercentSelector } from '@ui/features/beneficiaries/components/PercentSelector';
import { registrationErrorMessage } from '@ui/features/auth/authMessages';
import { useRegistration } from '@ui/features/registration/RegistrationProvider';
import { useResendCooldown } from '@ui/features/registration/hooks/useResendCooldown';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import { legalDocuments } from '@config/legal';
import type { AuthStackParamList } from '@ui/navigation/types';


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_RE = /^\d{5}$/;

const formatBirthDate = (text: string): string => {
  let digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length >= 1 && Number(digits[0]) > 3) digits = `0${digits}`.slice(0, 8);
  if (digits.length >= 3 && Number(digits[2]) > 1) {
    digits = `${digits.slice(0, 2)}0${digits.slice(2)}`.slice(0, 8);
  }
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

function StepFooter({ children }: { children: ReactNode }) {
  return <View className="gap-sm px-lg pb-lg pt-sm">{children}</View>;
}
function SecureInput(props: InputProps) {
  const [hidden, setHidden] = useState(true);
  return (
    <Input
      {...props}
      secureTextEntry={hidden}
      rightSlot={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Mostrar' : 'Ocultar'}
          hitSlop={8}
          onPress={() => setHidden((value) => !value)}
        >
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9A9384" />
        </Pressable>
      }
    />
  );
}

function OccupationField({
  label,
  onSelect,
}: {
  label: string;
  onSelect: (key: string, label: string) => void;
}) {
  const { getOccupations } = useContainer();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<readonly CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (items.length > 0) return;
    setLoading(true);
    void getOccupations()
      .then((res) => {
        if (res.ok) setItems(res.value);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  return (
    <View className="w-full gap-sm">
      <Text variant="caption" tone="muted" className="font-medium">
        Ocupación
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setOpen(true);
          load();
        }}
        style={{ height: 56 }}
        className="flex-row items-center gap-sm rounded-md border-2 border-transparent bg-neutral-100 px-md dark:bg-neutral-800"
      >
        <Ionicons name="briefcase-outline" size={20} color="#9A9384" />
        <Text variant="body" tone={label ? 'default' : 'muted'} className="flex-1">
          {label || '¿A qué te dedicas?'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9A9384" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50" onPress={() => setOpen(false)} />
        <View
          className="max-h-[75%] gap-md bg-neutral-0 px-lg pb-10 pt-lg dark:bg-neutral-900"
          style={{ borderTopLeftRadius: 26, borderTopRightRadius: 26 }}
        >
          <Text variant="h2">Ocupación</Text>
          {loading ? <ActivityIndicator color="#FCD535" /> : null}
          <FlatList
            data={items}
            keyExtractor={(item) => item.key}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              !loading ? <Text tone="muted">No se pudo cargar el catálogo.</Text> : null
            }
            renderItem={({ item }) => (
              <Pressable
                className="border-b border-neutral-100 py-md dark:border-neutral-800"
                onPress={() => {
                  onSelect(item.key, item.label);
                  setOpen(false);
                }}
              >
                <Text variant="body">{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T | '';
  options: readonly { readonly value: T; readonly label: string }[];
  onSelect: (value: T) => void;
}) {
  return (
    <View className="w-full gap-sm">
      <Text variant="caption" tone="muted" className="font-medium">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-sm">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(option.value)}
              style={{ minHeight: 44 }}
              className={cn(
                'items-center justify-center rounded-pill border-2 px-lg',
                selected
                  ? 'border-brand-500 bg-brand-100'
                  : 'border-transparent bg-neutral-100 dark:bg-neutral-800',
              )}
            >
              <Text variant="body" tone={selected ? 'brand' : 'default'} className="font-semibold">
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

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
      currentStep: 'demographics',
    });
    navigation.navigate('RegisterDemographics');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="gap-md p-lg" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
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
        <SecureInput
          label="Contraseña"
          leftIcon="lock-closed-outline"
          placeholder="Crea una contraseña segura"
          value={password}
          onChangeText={setPassword}
          error={passwordError ?? undefined}
        />
        <SecureInput
          label="Confirmar contraseña"
          leftIcon="lock-closed-outline"
          placeholder="Repite tu contraseña"
          value={confirm}
          onChangeText={setConfirm}
          error={confirm.length > 0 && confirm !== password ? 'No coincide' : undefined}
        />
        <View style={{ height: 16 }} />
      </ScrollView>
      </KeyboardAvoidingView>
      <StepFooter>
        <Button title="Continuar" full disabled={!valid} onPress={onContinue} />
      </StepFooter>
    </SafeAreaView>
  );
}

type DemographicsProps = NativeStackScreenProps<AuthStackParamList, 'RegisterDemographics'>;
export function RegisterDemographicsScreen({ navigation }: DemographicsProps) {
  const { draft, update } = useRegistration();
  const [birthDate, setBirthDate] = useState(draft.birthDate);
  const [gender, setGender] = useState(draft.gender);
  const [nationality, setNationality] = useState<Nationality>(draft.nationality);
  const [resident, setResident] = useState<ResidentStatus>(draft.resident);
  const [curp, setCurp] = useState(draft.curp);
  const [occupation, setOccupation] = useState(draft.occupation);
  const [occupationLabel, setOccupationLabel] = useState(draft.occupationLabel);
  const [formError, setFormError] = useState<string | null>(null);

  const birthDateComplete = birthDate.length === 10;
  const birthDateError =
    birthDateComplete && !isAdult(birthDate) ? 'Debes ser mayor de edad.' : undefined;
  const curpError =
    nationality === 'mexicana' && curp.length > 0 && !isValidCurp(curp)
      ? 'CURP inválida.'
      : undefined;

  // Returns the first missing/invalid field so the button can say exactly what's pending.
  const missingMessage = (): string | null => {
    if (!birthDateComplete || birthDateError) return 'Ingresa una fecha de nacimiento válida.';
    if (gender !== 'Masculino' && gender !== 'Femenino') return 'Selecciona tu género.';
    if (nationality === 'mexicana' && !isValidCurp(curp)) return 'Captura una CURP válida.';
    if (nationality === 'extranjera' && resident === '')
      return 'Selecciona tu situación migratoria.';
    if (occupation === '') return 'Selecciona tu ocupación.';
    return null;
  };

  const onContinue = () => {
    const message = missingMessage();
    if (message) {
      setFormError(message);
      return;
    }
    setFormError(null);
    update({
      birthDate,
      gender,
      occupation,
      occupationLabel,
      nationality,
      resident: nationality === 'extranjera' ? resident : '',
      curp: nationality === 'mexicana' ? curp.toUpperCase() : '',
      currentStep: 'document',
    });
    navigation.navigate('RegisterDocument');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-md p-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs pb-sm">
          <Text variant="h1">Cuéntanos de ti</Text>
          <Text variant="body" tone="muted">
            Necesitamos estos datos por regulación de tu cuenta.
          </Text>
        </View>
        <Input
          label="Fecha de nacimiento"
          leftIcon="calendar-outline"
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
          value={birthDate}
          onChangeText={(t) => setBirthDate(formatBirthDate(t))}
          error={birthDateError}
        />
        <ChoiceGroup
          label="Género"
          value={gender}
          onSelect={setGender}
          options={[
            { value: 'Femenino', label: 'Femenino' },
            { value: 'Masculino', label: 'Masculino' },
          ]}
        />
        <ChoiceGroup
          label="Nacionalidad"
          value={nationality}
          onSelect={setNationality}
          options={[
            { value: 'mexicana', label: 'Mexicana' },
            { value: 'extranjera', label: 'Extranjera' },
          ]}
        />
        {nationality === 'extranjera' ? (
          <ChoiceGroup
            label="Situación migratoria"
            value={resident}
            onSelect={setResident}
            options={[
              { value: 'fm', label: 'Tengo FM' },
              { value: 'passport', label: 'Solo pasaporte' },
            ]}
          />
        ) : (
          <Input
            label="CURP"
            leftIcon="id-card-outline"
            placeholder="18 caracteres"
            autoCapitalize="characters"
            maxLength={18}
            value={curp}
            onChangeText={(t) => setCurp(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            error={curpError}
          />
        )}
        <OccupationField
          label={occupationLabel}
          onSelect={(key, optionLabel) => {
            setOccupation(key);
            setOccupationLabel(optionLabel);
            setFormError(null);
          }}
        />
      </ScrollView>
      <StepFooter>
        {formError ? (
          <Text variant="caption" tone="danger" center>
            {formError}
          </Text>
        ) : null}
        <Button title="Continuar" full onPress={onContinue} />
      </StepFooter>
    </SafeAreaView>
  );
}

type AddressProps = NativeStackScreenProps<AuthStackParamList, 'RegisterAddress'>;
export function RegisterAddressScreen({ navigation }: AddressProps) {
  const { draft, update } = useRegistration();
  const [postalCode, setPostalCode] = useState(draft.address.postalCode);
  const [colony, setColony] = useState(draft.address.colony);
  const [colonySelected, setColonySelected] = useState(draft.address.colonySelected);
  const [municipality, setMunicipality] = useState(draft.address.municipality);
  const [state, setState] = useState(draft.address.state);
  const [street, setStreet] = useState(draft.address.street);
  const [extNumber, setExtNumber] = useState(draft.address.extNumber);
  const [intNumber, setIntNumber] = useState(draft.address.intNumber);

  const valid =
    POSTAL_RE.test(postalCode) &&
    colony.trim() !== '' &&
    street.trim().length >= 3 &&
    extNumber.trim() !== '';

  const onContinue = () => {
    if (!valid) return;
    update({
      address: {
        postalCode,
        colony,
        colonySelected,
        municipality,
        state,
        street: street.trim(),
        extNumber: extNumber.trim(),
        intNumber: intNumber.trim(),
      },
      currentStep: 'beneficiaries',
    });
    navigation.navigate('RegisterBeneficiaries');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-md p-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs pb-sm">
          <Text variant="h1">Tu domicilio</Text>
          <Text variant="body" tone="muted">
            Captura tu código postal y elige tu colonia.
          </Text>
        </View>
        <Input
          label="Código postal"
          leftIcon="location-outline"
          placeholder="5 dígitos"
          keyboardType="number-pad"
          maxLength={5}
          value={postalCode}
          onChangeText={(t) => setPostalCode(t.replace(/\D/g, '').slice(0, 5))}
        />
        <ColonyPicker
          postalCode={postalCode}
          value={colony}
          onSelect={(info) => {
            setColony(info.colony);
            setColonySelected(info.id);
            setMunicipality(info.municipality);
            setState(info.state);
            if (info.postalCode) setPostalCode(info.postalCode);
          }}
        />
        <Input
          label="Calle"
          leftIcon="home-outline"
          placeholder="Calle"
          value={street}
          onChangeText={setStreet}
        />
        <View className="flex-row gap-md">
          <View className="flex-1">
            <Input
              label="No. exterior"
              placeholder="Ext."
              value={extNumber}
              onChangeText={setExtNumber}
            />
          </View>
          <View className="flex-1">
            <Input
              label="No. interior (opcional)"
              placeholder="Int."
              value={intNumber}
              onChangeText={setIntNumber}
            />
          </View>
        </View>
      </ScrollView>
      <StepFooter>
        <Button title="Continuar" full disabled={!valid} onPress={onContinue} />
      </StepFooter>
    </SafeAreaView>
  );
}

type DocumentProps = NativeStackScreenProps<AuthStackParamList, 'RegisterDocument'>;
type Side = 'front' | 'back';
export function RegisterDocumentScreen({ navigation }: DocumentProps) {
  const { getRequiredDocuments, extractDocumentData } = useContainer();
  const { draft, update } = useRegistration();
  const toast = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [documentId, setDocumentId] = useState('');
  const [requiresBack, setRequiresBack] = useState(true);
  const [front, setFront] = useState(draft.documentFrontUri);
  const [back, setBack] = useState(draft.documentBackUri);
  const [capturing, setCapturing] = useState<Side | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getRequiredDocuments(draft.nationality, draft.resident || 'si').then((res) => {
      if (!active || !res.ok) return;
      setDocumentId(res.value.documentId);
      setRequiresBack(res.value.requiresBack);
    });
    return () => {
      active = false;
    };
  }, [getRequiredDocuments, draft.nationality, draft.resident]);

  const onCapture = async () => {
    if (!cameraRef.current || !capturing) return;
    setBusy(true);
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
    const side = capturing;
    setCapturing(null);
    setBusy(false);
    if (!photo?.uri) return;
    if (side === 'front') {
      setFront(photo.uri);
      void runOcr(photo.uri);
    } else {
      setBack(photo.uri);
    }
  };

  const runOcr = async (uri: string) => {
    if (!documentId) return;
    const res = await extractDocumentData(documentId, {
      uri,
      name: 'id_front.jpg',
      type: 'image/jpeg',
    });
    if (!res.ok) return;
    update({
      documentExtracted: true,
      ...(res.value.curp && !draft.curp ? { curp: res.value.curp } : {}),
      ...(res.value.firstName && !draft.firstName ? { firstName: res.value.firstName } : {}),
      ...(res.value.lastName && !draft.lastName ? { lastName: res.value.lastName } : {}),
      ...(res.value.lastName2 && !draft.lastName2 ? { lastName2: res.value.lastName2 } : {}),
    });
    toast.success('Leímos los datos de tu documento.');
  };

  const onContinue = (skip: boolean) => {
    update({
      documentType: skip ? '' : 'ine',
      documentFrontUri: skip ? '' : front,
      documentBackUri: skip ? '' : back,
      currentStep: 'address',
    });
    navigation.navigate('RegisterAddress');
  };

  const valid = Boolean(front) && (!requiresBack || Boolean(back));

  if (capturing) {
    if (!permission?.granted) {
      return (
        <SafeAreaView className="flex-1 items-center justify-center gap-md bg-neutral-0 px-lg dark:bg-neutral-950">
          <Ionicons name="camera-outline" size={48} color="#97720A" />
          <Text variant="h2" center>
            Permite la cámara
          </Text>
          <Text variant="body" tone="muted" center>
            La necesitamos para fotografiar tu identificación.
          </Text>
          <Button title="Permitir cámara" full onPress={() => void requestPermission()} />
          <Button title="Cancelar" variant="ghost" full onPress={() => setCapturing(null)} />
        </SafeAreaView>
      );
    }
    return (
      <View className="flex-1 bg-black">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View className="absolute inset-x-0 bottom-2xl items-center gap-md">
          <Text variant="body" className="rounded-pill bg-black/60 px-lg py-sm text-neutral-0">
            {capturing === 'front'
              ? 'Captura el frente de tu identificación'
              : 'Captura el reverso'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tomar foto"
            disabled={busy}
            onPress={() => void onCapture()}
            className="h-16 w-16 items-center justify-center rounded-pill bg-neutral-0"
          >
            {busy ? (
              <ActivityIndicator color="#1B1812" />
            ) : (
              <Ionicons name="camera" size={28} color="#1B1812" />
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-md p-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs pb-sm">
          <Text variant="h1">Tu identificación</Text>
          <Text variant="body" tone="muted">
            Toma una foto de tu identificación oficial (INE o pasaporte). Leeremos tus datos
            automáticamente.
          </Text>
        </View>

        <DocumentTile label="Frente" uri={front} onCapture={() => setCapturing('front')} />
        {requiresBack ? (
          <DocumentTile label="Reverso" uri={back} onCapture={() => setCapturing('back')} />
        ) : null}
      </ScrollView>
      <StepFooter>
        <Button title="Continuar" full disabled={!valid} onPress={() => onContinue(false)} />
        <Button
          title="No tengo cámara disponible"
          variant="ghost"
          full
          onPress={() => onContinue(true)}
        />
      </StepFooter>
    </SafeAreaView>
  );
}

function DocumentTile({
  label,
  uri,
  onCapture,
}: {
  label: string;
  uri: string;
  onCapture: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onCapture}
      className="items-center justify-center gap-sm overflow-hidden rounded-card border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800"
      style={{ height: 160 }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <>
          <Ionicons name="camera-outline" size={32} color="#97720A" />
          <Text variant="caption" tone="muted">
            {label} — tocar para capturar
          </Text>
        </>
      )}
    </Pressable>
  );
}

const MAX_REGISTRATION_BENEFICIARIES = 4;
const emptyBeneficiary = (): RegistrationBeneficiary => ({
  firstName: '',
  lastName: '',
  lastName2: '',
  percent: null,
});
type BeneficiariesProps = NativeStackScreenProps<AuthStackParamList, 'RegisterBeneficiaries'>;
export function RegisterBeneficiariesScreen({ navigation }: BeneficiariesProps) {
  const { draft, update } = useRegistration();
  const [list, setList] = useState<RegistrationBeneficiary[]>(
    draft.beneficiaries.length > 0 ? [...draft.beneficiaries] : [emptyBeneficiary()],
  );

  const total = list.reduce((sum, b) => sum + (b.percent ?? 0), 0);
  const updateItem = (index: number, patch: Partial<RegistrationBeneficiary>) =>
    setList((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  const add = () =>
    setList((prev) =>
      prev.length >= MAX_REGISTRATION_BENEFICIARIES ? prev : [...prev, emptyBeneficiary()],
    );
  const remove = (index: number) => setList((prev) => prev.filter((_, i) => i !== index));

  const namesOk = list.every(
    (b) => isValidName(b.firstName) && isValidName(b.lastName) && isValidName(b.lastName2),
  );
  const valid = list.length >= 1 && namesOk && total === 100;

  const onContinue = () => {
    if (!valid) return;
    update({ beneficiaries: list, currentStep: 'survey' });
    navigation.navigate('RegisterSurvey');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-md p-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs pb-sm">
          <Text variant="h1">Beneficiarios</Text>
          <Text variant="body" tone="muted">
            Agrega al menos un beneficiario. Los porcentajes deben sumar 100%.
          </Text>
        </View>

        {list.map((item, index) => {
          const othersTotal = total - (item.percent ?? 0);
          return (
            <View
              key={index}
              className="gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
            >
              <View className="flex-row items-center justify-between">
                <Text variant="body" className="font-semibold">
                  Beneficiario {index + 1}
                </Text>
                {list.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar beneficiario ${index + 1}`}
                    hitSlop={8}
                    onPress={() => remove(index)}
                    style={{ minHeight: 44 }}
                    className="flex-row items-center gap-sm"
                  >
                    <Ionicons name="trash-outline" size={18} color="#C24A30" />
                    <Text variant="caption" tone="danger" className="font-medium">
                      Quitar
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              <Input
                label="Nombre(s)"
                placeholder="Nombre"
                value={item.firstName}
                onChangeText={(t) => updateItem(index, { firstName: t })}
              />
              <Input
                label="Apellido paterno"
                placeholder="Apellido paterno"
                value={item.lastName}
                onChangeText={(t) => updateItem(index, { lastName: t })}
              />
              <Input
                label="Apellido materno"
                placeholder="Apellido materno"
                value={item.lastName2}
                onChangeText={(t) => updateItem(index, { lastName2: t })}
              />
              <PercentSelector
                value={item.percent}
                maxPercent={100 - othersTotal}
                allowHundred={list.length === 1}
                onSelect={(percent: BeneficiaryPercent) => updateItem(index, { percent })}
              />
            </View>
          );
        })}

        {list.length > 0 ? (
          <Text
            variant="caption"
            tone={total === 100 ? 'brand' : 'muted'}
            className="font-semibold"
          >
            Total asignado: {total}% / 100%
          </Text>
        ) : null}

        {list.length < MAX_REGISTRATION_BENEFICIARIES ? (
          <Button title="Agregar beneficiario" variant="outline" full onPress={add} />
        ) : null}
      </ScrollView>
      <StepFooter>
        <Button title="Continuar" full disabled={!valid} onPress={onContinue} />
      </StepFooter>
    </SafeAreaView>
  );
}

type SurveyProps = NativeStackScreenProps<AuthStackParamList, 'RegisterSurvey'>;
export function RegisterSurveyScreen({ navigation }: SurveyProps) {
  const { getTransactionalProfileQuestions } = useContainer();
  const { draft, update } = useRegistration();
  const [sells, setSells] = useState(
    draft.sellsFromHome === null ? '' : draft.sellsFromHome ? 'si' : 'no',
  );
  const [questions, setQuestions] = useState<readonly TransactionalQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries((draft.transactionalProfile ?? []).map((a) => [a.key, a.value])),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getTransactionalProfileQuestions()
      .then((res) => {
        if (active && res.ok) setQuestions(res.value);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [getTransactionalProfileQuestions]);

  const valid = questions.every((q) => Boolean(answers[q.key]));

  const onContinue = () => {
    if (!valid) return;
    update({
      sellsFromHome: sells === 'si' ? true : sells === 'no' ? false : null,
      transactionalProfile: questions.map((q) => ({ key: q.key, value: answers[q.key] ?? '' })),
      currentStep: 'nip',
    });
    navigation.navigate('RegisterNip');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-lg p-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs pb-sm">
          <Text variant="h1">Perfil transaccional</Text>
          <Text variant="body" tone="muted">
            Cuéntanos con qué frecuencia planeas usar tu cuenta Medá.
          </Text>
        </View>
        <ChoiceGroup
          label="¿Vendes productos o servicios desde tu casa?"
          value={sells}
          onSelect={setSells}
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ]}
        />
        {loading ? (
          <ActivityIndicator color="#FCD535" />
        ) : (
          questions.map((q) => (
            <ChoiceGroup
              key={q.key}
              label={q.text}
              value={answers[q.key] ?? ''}
              onSelect={(value) => setAnswers((prev) => ({ ...prev, [q.key]: value }))}
              options={q.options}
            />
          ))
        )}
      </ScrollView>
      <StepFooter>
        <Button title="Continuar" full disabled={!valid} onPress={onContinue} />
      </StepFooter>
    </SafeAreaView>
  );
}

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
          <SecureInput
            label="NIP"
            leftIcon="keypad-outline"
            placeholder="6 dígitos"
            keyboardType="number-pad"
            maxLength={6}
            value={nip}
            onChangeText={(t) => setNip(t.replace(/[^0-9]/g, ''))}
          />
          <SecureInput
            label="Confirma tu NIP"
            leftIcon="keypad-outline"
            placeholder="6 dígitos"
            keyboardType="number-pad"
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
  linkLabel,
  onLink,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  linkLabel?: string;
  onLink?: () => void;
}) {
  return (
    <View className="gap-xs py-sm">
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className="flex-row items-start gap-sm"
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
      {linkLabel && onLink ? (
        <Pressable onPress={onLink} className="ml-8">
          <Text variant="body" tone="link" className="font-semibold">
            {linkLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function LegalDocModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const { WebView } = require('react-native-webview');
  const [loading, setLoading] = useState(true);
  const pdfUrl =
    Platform.OS === 'ios'
      ? url
      : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
        <View className="flex-row items-center gap-sm border-b border-neutral-200 px-md py-sm dark:border-neutral-800">
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar">
            <Ionicons name="close" size={26} color="#1B1812" />
          </Pressable>
          <Text variant="h2" className="flex-1">{title}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: pdfUrl }}
            onLoadEnd={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{ flex: 1 }}
            startInLoadingState
          />
          {loading ? (
            <View className="absolute inset-0 items-center justify-center gap-md bg-neutral-0">
              <ActivityIndicator size="large" color="#FCD535" />
              <Text variant="body" tone="muted">Cargando documento…</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

type LegalProps = NativeStackScreenProps<AuthStackParamList, 'RegisterLegal'>;
export function RegisterLegalScreen({ navigation }: LegalProps) {
  const { register } = useContainer();
  const { draft, update, reset } = useRegistration();
  const toast = useToast();
  const [terms, setTerms] = useState(draft.acceptedTerms);
  const [privacy, setPrivacy] = useState(draft.acceptedPrivacy);
  const [opening, setOpening] = useState(draft.acceptedAccountOpening);
  const [coords, setCoords] = useState<{ latitude: string; longitude: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalUrl, setModalUrl] = useState<{ url: string; title: string } | null>(null);
  const valid = terms && privacy && opening;

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (!perm.granted) return;
        const pos = await Location.getCurrentPositionAsync({});
        if (active) {
          setCoords({
            latitude: String(pos.coords.latitude),
            longitude: String(pos.coords.longitude),
          });
        }
      } catch {
        console.log('Error al obtener la ubicación');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onCreate = async () => {
    if (!valid) return;
    update({ acceptedTerms: terms, acceptedPrivacy: privacy, acceptedAccountOpening: opening });
    setLoading(true);
    const res = await register({
      ...draft,
      acceptedTerms: terms,
      acceptedPrivacy: privacy,
      acceptedAccountOpening: opening,
      ...(coords ?? {}),
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
          linkLabel="Leer términos y condiciones"
          onLink={() => setModalUrl({ url: legalDocuments.find(d => d.id === 'terms')?.url ?? '', title: 'Términos y Condiciones' })}
        />
        <CheckRow
          checked={privacy}
          onToggle={() => setPrivacy((v) => !v)}
          label="He leído y acepto los términos del Aviso de Privacidad y que mis datos sean utilizados con fines publicitarios conforme a los mismos."
          linkLabel="Leer aviso de privacidad"
          onLink={() => setModalUrl({ url: legalDocuments.find(d => d.id === 'privacy')?.url ?? '', title: 'Aviso de Privacidad' })}
        />
        <CheckRow
          checked={opening}
          onToggle={() => setOpening((v) => !v)}
          label="Acepto la apertura de cuenta con Programas de Relacionamiento Medá, S.A.P.I. de C.V., Institución de Fondos de Pago Electrónico."
        />
        <View className="gap-sm pt-sm">
          <Text variant="caption" tone="muted">
            Al proporcionar tu correo electrónico aceptas recibir por parte de Medá noticias y comunicaciones promocionales. Podrás revocar dicho consentimiento en cualquier momento, para más detalles consulta nuestro Aviso de Privacidad.
          </Text>
          <Text variant="caption" tone="muted">
            Ni el Gobierno Federal ni las entidades de la administración pública paraestatal podrán responsabilizarse o garantizar los recursos de los Clientes que sean utilizados en las operaciones que celebren con Medá o frente a otros, así como tampoco asumir alguna responsabilidad por las obligaciones contraídas con Medá o por algún Cliente frente a otro, en virtud de las operaciones que celebren.
          </Text>
        </View>
        <View className="items-center gap-md pt-sm">
          <Pressable
            accessibilityRole="button"
            onPress={() => void Linking.openURL('mailto:soporte@meda.com.mx')}
          >
            <Text variant="body" tone="link" className="font-semibold">
              ¿Problemas para registrarte?
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <StepFooter>
        <Button title="Crear cuenta" full loading={loading} disabled={!valid} onPress={onCreate} />
      </StepFooter>
      {modalUrl ? (
        <LegalDocModal
          url={modalUrl.url}
          title={modalUrl.title}
          onClose={() => setModalUrl(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}
