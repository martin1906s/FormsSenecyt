## Backend - Soporte para Fase 2 y Datos de Facturación

### 1. Resumen funcional

- **Fase 1 (ya existente)**: pasos 1–7 (Ficha Estudiantil).
- **Fase 2 (nueva)**: pasos 8–13:
  - 8: Becas y Ayudas
  - 9: Vinculación Social
  - 10: Datos del Hogar
  - 11: Composición Familiar
  - 12: Ingresos Familiares
  - 13: Datos de Facturación (nuevo bloque de campos)

El frontend ahora:
- Usa SIEMPRE el mismo endpoint `POST /estudiantes/guardar-paso` para ir guardando los pasos.
- Cuando detecta que la Fase 1 está completa (por cédula), permite continuar con la Fase 2.
- Incluye campos nuevos de **Datos de Facturación** en el payload cuando se guarda el último paso.

---

### 2. Campos nuevos de Datos de Facturación

Se agregaron estos campos al formulario (en el `FormGroup` del frontend):

- `tipoComprobante` (string)
  - Valores esperados: `"FACTURA" | "NOTA_VENTA"`.
- `facturacionNombre` (string)
  - Nombre completo o razón social.
- `facturacionTipoIdentificacion` (string)
  - Valores esperados: `"CEDULA" | "RUC"`.
- `facturacionIdentificacion` (string)
  - Número de cédula o RUC.
- `facturacionDireccion` (string)
  - Dirección para la factura.
- `facturacionCorreo` (string)
  - Correo para envío de la factura.
- `facturacionTelefono` (string)
  - Teléfono de contacto para facturación.

#### Requisitos recomendados en backend

- Todos los campos anteriores deben aceptarse en el cuerpo de:
  - `POST /estudiantes`
  - `POST /estudiantes/guardar-paso`
  - `PUT /estudiantes/:id`
- Validaciones sugeridas:
  - `tipoComprobante`: obligatorio, solo `"FACTURA"` o `"NOTA_VENTA"`.
  - `facturacionNombre`: obligatorio, longitud máxima recomendada 120–150 caracteres.
  - `facturacionTipoIdentificacion`: obligatorio, `"CEDULA"` o `"RUC"`.
  - `facturacionIdentificacion`:
    - obligatorio,
    - para `"CEDULA"`: 10 dígitos,
    - para `"RUC"`: 13 dígitos.
  - `facturacionDireccion`: obligatorio, longitud máxima 200–255 caracteres.
  - `facturacionCorreo`: obligatorio, formato email válido, longitud máxima ~120–150.
  - `facturacionTelefono`: obligatorio, longitud máxima 20, solo dígitos y algunos símbolos (`+`, `-`, espacios).

Implementación recomendada:
- Agregar columnas en la tabla `Estudiante` **o**
- Crear tabla asociada `DatosFacturacion` relacionada por `estudianteId`.

---

### 3. Estado de las fases en la búsqueda por cédula

Para que el frontend pueda decidir qué mostrar cuando el usuario ingresa su cédula en el Paso 1, el endpoint:

```http
GET /estudiantes/buscar?tipoDocumento=CEDULA&numeroIdentificacion=XXXXXXXXXX
```

debería devolver, además de los datos del estudiante, **estos flags**:

```json
{
  "id": 1,
  "numeroIdentificacion": "1234567890",
  // ...otros campos...
  "registroFichaEstudiantilCompletado": true,
  "registroFichaSocioeconomicaCompletado": false,
  "registroDatosFacturacionCompletado": false
}
```

El frontend actualmente:
- Usa la lógica interna para detectar si la **Ficha Estudiantil (pasos 1–7)** está completa y mostrar un modal invitando a continuar con la Fase 2.
- Puede simplificarse más adelante para usar directamente estos flags si el backend los implementa.

#### Lógica sugerida para los flags

```pseudo
registroFichaEstudiantilCompletado = todos los campos requeridos de pasos 1–7 tienen valor válido
registroFichaSocioeconomicaCompletado = todos los campos requeridos de pasos 8–12 tienen valor válido
registroDatosFacturacionCompletado = todos los campos de Datos de Facturación tienen valor válido
```

Se recomienda centralizar esta lógica en helpers o métodos de dominio, por ejemplo:

- `esFichaEstudiantilCompleta(estudiante)`
- `esFichaSocioeconomicaCompleta(estudiante)`
- `esFacturacionCompleta(estudiante)`

---

### 4. Compatibilidad con endpoints existentes

Endpoints a revisar/actualizar:

1. `POST /estudiantes`
   - Debe aceptar los campos nuevos de facturación.
2. `POST /estudiantes/guardar-paso`
   - Upsert por cédula/tipoDocumento.
   - Si llega solamente parte de los campos (ej. solo Fase 2), **NO** debe sobreescribir a `null` los campos de Fase 1 si no vienen en el body.
   - Recomendado: hacer un `find` + `merge` de datos previos antes de guardar.
3. `PUT /estudiantes/:id`
   - Igual que arriba: aceptar y actualizar los campos de facturación.
4. `GET /estudiantes/buscar`
   - Devolver los nuevos campos + flags de estado de fases si se implementan.

---

### 5. Recomendaciones técnicas

1. **Migración de base de datos**  
   - Agregar campos de facturación a `Estudiante` o crear tabla `DatosFacturacion`.
2. **DTOs / Schemas**  
   - Actualizar DTOs de entrada/salida (`EstudianteDto`, `UpdateEstudianteDto`, etc.) para incluir los campos nuevos.
3. **Validación**  
   - Usar validadores (`class-validator`, `Joi`, etc.) para garantizar que los datos cumplen las reglas descritas arriba.
4. **Tests**  
   - Agregar pruebas que verifiquen:
     - Creación de estudiante con facturación.
     - Actualización parcial por pasos (guardar-paso) sin perder datos previos.
     - Cálculo correcto de los flags de fase completada (si se implementan).

---

### 6. Comportamiento esperado desde el frontend

1. Usuario ingresa cédula en Paso 1:
   - Si no existe registro: comienza desde Paso 1 y avanza hasta el 13 normalmente.
   - Si Fase 1 está completa y Fase 2 incompleta: el frontend muestra un modal invitando a continuar desde el **Paso 8**.
   - Si todo está completo (incluida facturación): el frontend muestra un modal de “registro completado”.

2. En el último paso (Datos de Facturación):
   - Al guardar, el frontend envía TODOS los campos del formulario, incluidos los de facturación.
   - El backend debe persistirlos y, opcionalmente, marcar `registroDatosFacturacionCompletado = true`.

