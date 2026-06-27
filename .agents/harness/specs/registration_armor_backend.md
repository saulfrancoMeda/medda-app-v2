# Bloqueo de registro en staging: servicio Armor (para equipo backend)

- Fecha: 2026-06-12
- Entorno afectado: `https://stageapiagents.centau.io` (repo `adminmerchant`)
- Estado del cliente movil: payload de registro **completo y aceptado por el form** `AgentRegisterType`
  (ya no hay errores de validacion de campos). El unico bloqueo restante es Armor.

## Sintoma (reproducible desde la app)

1. `POST /public/black-lists/check` con `{ firstName, lastName, lastName2 }` responde:

```json
{
  "error_code": 999,
  "errors": { "0": "[Armor] Object reference not set to an instance of an object." },
  "status": "ERROR",
  "status_code": 400
}
```

2. `POST /public/register/v2` (payload valido) responde el mismo error 999 de Armor.

## Causa (rastreada en `adminmerchant`)

- `PublicController::blackListsValidate()` (linea ~1006) y `registerV2()` llaman a
  `ArmorManager::validate()` -> `ArmorPlatformService` (`src/ExternalProvider/ArmorPlatformService.php`).
- `ArmorPlatformService` llama por HTTP al microservicio externo **Armor (.NET, PLD/AML)**:
  - Login previo: `POST {armor.api.uri_base}{armor.api.endpoint.user}/IniciarSesion` con
    `armor.api.credentials.user` / `armor.api.credentials.password` (espera `data.info.result.token`).
  - Validacion de listas negras: endpoint `{armor.api.endpoint.person}/buscar`.
- El mensaje `"Object reference not set to an instance of an object"` es un **NullReferenceException
  devuelto por el propio servicio Armor .NET** (o por configuracion vacia de los parametros
  `armor.api.*` en staging). El backend PHP solo lo propaga como error 999.

## Que necesitamos de backend

Revisar en el entorno de staging los parametros/env de `adminmerchant`:

- `armor.api.uri_base` (apunta a una instancia de Armor viva?)
- `armor.api.credentials.user` / `armor.api.credentials.password` (validas?)
- `armor.api.endpoint.user`, `armor.api.endpoint.person`, etc.

Y/o levantar la instancia de Armor de staging. Alternativa temporal de QA (decision de
backend + cumplimiento, NO de la app): flag `ARMOR_ENABLED=false` en staging que haga que
`ArmorManager::validate()` trate los fallos de infraestructura como "sin coincidencias"
(`['data' => ['total' => 0], 'dataINE' => ['total' => 0]]`) y que `crudClient()` omita el alta en
Armor. Esto desactiva un control AML: solo staging, nunca produccion.

## Respuestas esperadas cuando Armor funcione (contrato que consume la app)

1. `POST /public/black-lists/check` -> **200**:

```json
{ "validationSign": "<string cifrado>" }
```

La app envia ese valor tal cual como `blackListValidationSign` en el registro.

2. `POST /public/register/v2` -> **200** (`PublicController.php:1375-1382`):

```json
{ "data": { "id": <agentId>, "documentsValidation": { "state": "<pending|validate|rejected>" } } }
```

Con eso la app da el alta por exitosa y manda al usuario a iniciar sesion.

3. Si la persona SI aparece en listas negras, Armor responde y el backend lanza
   `BlackListsFoundException` -> error legible "Por el momento no es posible realizar tu registro"
   (la app ya muestra el mensaje del backend).

## Payload de referencia que la app ya envia (validado por el form)

Campos planos (sin envoltura): `cellphone, phone, firstName, lastName, lastName2, password, nip,
nipSignature(=nip), birthDate(dd/MM/yyyy), occupation(key CnbvCatalog), genre(0=Masculino,1=Femenino),
nationality(mx|ext), curp, resident(bool), latitude, longitude, documentsDeliveryWay(app|external),
email, sellProductsOrServicesInHome, blackListValidationSign, homeAddress{street,colony,municipality,
state,colonySelected,postalCode,extNumber,intNumber}, beneficiaries[{firstName,lastName,lastName2,
secondLastName,percent}], goalsSurvey[{key,value}], additionalData{isPep,noticeOfPrivacyCheck}`.
