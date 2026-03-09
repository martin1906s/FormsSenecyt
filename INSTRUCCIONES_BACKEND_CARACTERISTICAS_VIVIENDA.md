# Instrucciones para el Backend - Campos de Características de la Vivienda

## 📋 Resumen

Se han agregado **todos los campos de "Características de la Vivienda"** al formulario de inscripción. Estos campos ahora son visibles y se envían al backend cuando el estudiante completa el formulario.

---

## ✅ Campos que se Envían al Backend

### **5.5. Tipo de Propiedad de la Vivienda**

**Campo:** `tipoPropiedadVivienda`

**Tipo:** String (Enum)

**Valores posibles:**
- `'PROPIA'` - Propia
- `'ARRENDADA'` - Arrendada
- `'CEDIDA_TRABAJO'` - Cedida por trabajo
- `'CEDIDA_FAMILIAR'` - Cedida por familiar
- `'OTRO'` - Otro
- `'NA'` - No aplica

**Formato en el POST:**
```json
{
  "tipoPropiedadVivienda": "ARRENDADA"
}
```

**Valor por defecto si está vacío:** `'NA'`

---

### **5.6. Estructura de la Vivienda**

**Campo:** `estructuraVivienda`

**Tipo:** String (Enum o String con prefijo "OTRO:")

**Valores posibles:**
- `'HORMIGON'` - Hormigón
- `'LADRILLO'` - Ladrillo
- `'BLOQUE'` - Bloque
- `'ADOBE'` - Adobe
- `'MADERA'` - Madera
- `'CANA'` - Caña
- `'OTRO'` - Otro (se envía como `'OTRO: [especificación]'`)
- `'NA'` - No aplica

**Campo relacionado:** `estructuraViviendaEspecifique` (String, max 120 caracteres)

**Formato en el POST:**
```json
{
  "estructuraVivienda": "OTRO: Material mixto",
  "estructuraViviendaEspecifique": "Material mixto"
}
```

O si no es "OTRO":
```json
{
  "estructuraVivienda": "HORMIGON",
  "estructuraViviendaEspecifique": ""
}
```

**Lógica especial:**
- Si `estructuraVivienda === 'OTRO'`, se envía como: `'OTRO: ' + estructuraViviendaEspecifique`
- Si no es "OTRO", se envía el valor del enum directamente
- Valor por defecto si está vacío: `'NA'`

---

### **5.7. Tipo de Vivienda**

**Campo:** `tipoVivienda`

**Tipo:** String (Enum)

**Valores posibles:**
- `'SUITE_LUJO'` - Suite de lujo
- `'CASA'` - Casa
- `'DEPARTAMENTO'` - Departamento
- `'HABITACION'` - Habitación
- `'MEDIA_AGUA'` - Media agua
- `'RANCHO'` - Rancho
- `'NA'` - No aplica

**Formato en el POST:**
```json
{
  "tipoVivienda": "CASA"
}
```

**Valor por defecto si está vacío:** `'NA'`

---

### **5.9. Cantidad de Baños**

**Campo:** `cantidadBanos`

**Tipo:** Number (Integer) o `undefined`

**Validación en frontend:**
- Número entero entre 0 y 99
- Puede ser "NA" (se convierte a `undefined`)

**Formato en el POST:**
```json
{
  "cantidadBanos": 2
}
```

O si es "NA" o está vacío:
```json
{
  "cantidadBanos": undefined
}
```

**Nota:** El backend debe aceptar `null` o `undefined` si no se proporciona.

---

### **5.10. Cantidad de Habitaciones**

**Campo:** `cantidadHabitaciones`

**Tipo:** Number (Integer) o `undefined`

**Validación en frontend:**
- Número entero entre 0 y 99
- Puede ser "NA" (se convierte a `undefined`)

**Formato en el POST:**
```json
{
  "cantidadHabitaciones": 3
}
```

O si es "NA" o está vacío:
```json
{
  "cantidadHabitaciones": undefined
}
```

**Nota:** El backend debe aceptar `null` o `undefined` si no se proporciona.

---

### **5.11. ¿Compartes Habitación?**

**Campo:** `comparteHabitacion`

**Tipo:** String

**Descripción:** Texto libre que describe con quién comparte habitación (madre, padre, primas, primos, sobrinos, tías, tíos, pareja)

**Validación en frontend:**
- Máximo 200 caracteres
- Solo letras o "NA"

**Formato en el POST:**
```json
{
  "comparteHabitacion": "madre, padre"
}
```

O si es "NA" o está vacío:
```json
{
  "comparteHabitacion": "NA"
}
```

**Valor por defecto si está vacío:** `'NA'`

---

### **5.12. ¿Actualmente con Quién o Quiénes Vives?**

**Campo:** `conQuienVive`

**Tipo:** String

**Descripción:** Texto libre que describe con quién vive actualmente

**Validación en frontend:**
- Máximo 200 caracteres
- Solo letras o "NA"

**Formato en el POST:**
```json
{
  "conQuienVive": "madre, padre, hermanos"
}
```

O si es "NA" o está vacío:
```json
{
  "conQuienVive": "NA"
}
```

**Valor por defecto si está vacío:** `'NA'`

---

### **5.14. ¿El Tamaño de la Vivienda es Suficiente?**

**Campo:** `tamanoViviendaSuficiente`

**Tipo:** String (Enum)

**Valores posibles:**
- `'SI'` - Sí
- `'NO'` - No
- `'NA'` - No aplica

**Formato en el POST:**
```json
{
  "tamanoViviendaSuficiente": "SI"
}
```

**Valor por defecto si está vacío:** `'NA'`

---

## 📤 Ejemplo Completo de POST

```json
{
  "tipoPropiedadVivienda": "ARRENDADA",
  "estructuraVivienda": "HORMIGON",
  "estructuraViviendaEspecifique": "",
  "tipoVivienda": "CASA",
  "cantidadBanos": 2,
  "cantidadHabitaciones": 3,
  "comparteHabitacion": "NA",
  "conQuienVive": "madre, padre",
  "tamanoViviendaSuficiente": "SI",
  "croquisViviendaUrl": "https://bucket-url.com/maps/croquis-123.jpg"
}
```

---

## 🔍 Verificaciones Necesarias en el Backend

### **1. Campos en la Base de Datos**

Verificar que estos campos existan en la tabla `Estudiante`:

- ✅ `tipoPropiedadVivienda` (VARCHAR/TEXT)
- ✅ `estructuraVivienda` (VARCHAR/TEXT)
- ✅ `estructuraViviendaEspecifique` (VARCHAR/TEXT, nullable)
- ✅ `tipoVivienda` (VARCHAR/TEXT)
- ✅ `cantidadBanos` (INTEGER, nullable)
- ✅ `cantidadHabitaciones` (INTEGER, nullable)
- ✅ `comparteHabitacion` (VARCHAR/TEXT)
- ✅ `conQuienVive` (VARCHAR/TEXT)
- ✅ `tamanoViviendaSuficiente` (VARCHAR/TEXT)

### **2. Validaciones Recomendadas**

#### **tipoPropiedadVivienda:**
- Aceptar solo: `PROPIA`, `ARRENDADA`, `CEDIDA_TRABAJO`, `CEDIDA_FAMILIAR`, `OTRO`, `NA`
- Valor por defecto: `'NA'` si está vacío

#### **estructuraVivienda:**
- Aceptar: `HORMIGON`, `LADRILLO`, `BLOQUE`, `ADOBE`, `MADERA`, `CANA`, `OTRO`, `NA`
- Si viene con prefijo `'OTRO: '`, extraer la especificación
- Valor por defecto: `'NA'` si está vacío

#### **tipoVivienda:**
- Aceptar solo: `SUITE_LUJO`, `CASA`, `DEPARTAMENTO`, `HABITACION`, `MEDIA_AGUA`, `RANCHO`, `NA`
- Valor por defecto: `'NA'` si está vacío

#### **cantidadBanos y cantidadHabitaciones:**
- Aceptar números enteros entre 0 y 99
- Aceptar `null` o `undefined` si no se proporciona
- No requerir estos campos (opcionales)

#### **comparteHabitacion y conQuienVive:**
- Aceptar strings de hasta 200 caracteres
- Valor por defecto: `'NA'` si está vacío

#### **tamanoViviendaSuficiente:**
- Aceptar solo: `SI`, `NO`, `NA`
- Valor por defecto: `'NA'` si está vacío

### **3. Endpoints Afectados**

Estos campos se envían en:
- `POST /estudiantes` - Crear nuevo estudiante
- `POST /estudiantes/guardar-paso` - Guardar paso del formulario
- `PUT /estudiantes/:id` - Actualizar estudiante existente

### **4. Respuesta GET**

Cuando se obtiene un estudiante, estos campos deben devolverse:

```json
{
  "id": 1,
  "numeroIdentificacion": "1234567890",
  "tipoPropiedadVivienda": "ARRENDADA",
  "estructuraVivienda": "HORMIGON",
  "estructuraViviendaEspecifique": null,
  "tipoVivienda": "CASA",
  "cantidadBanos": 2,
  "cantidadHabitaciones": 3,
  "comparteHabitacion": "NA",
  "conQuienVive": "madre, padre",
  "tamanoViviendaSuficiente": "SI",
  "croquisViviendaUrl": "https://bucket-url.com/maps/croquis-123.jpg"
}
```

---

## ⚠️ Notas Importantes

1. **Campos Opcionales:** Todos estos campos son opcionales. Si no se proporcionan, deben tener valores por defecto (`'NA'` para strings, `null`/`undefined` para números).

2. **Compatibilidad:** Estos campos ya deberían existir en el backend según el código del frontend. Solo necesitas verificar que:
   - Los nombres de los campos coincidan exactamente
   - Los tipos de datos sean correctos
   - Las validaciones acepten los valores que envía el frontend

3. **Estructura Vivienda Especial:** El campo `estructuraVivienda` puede venir con el formato `'OTRO: [especificación]'`. El backend debe:
   - Extraer la especificación si viene con prefijo "OTRO: "
   - Guardar `estructuraVivienda = 'OTRO'`
   - Guardar `estructuraViviendaEspecifique = '[especificación]'`

4. **Números Opcionales:** `cantidadBanos` y `cantidadHabitaciones` pueden ser `null` o `undefined`. El backend debe aceptar estos valores.

---

## 🧪 Pruebas Recomendadas

1. **Crear estudiante con todos los campos:**
   - Enviar POST con todos los campos de características de vivienda
   - Verificar que se guardan correctamente

2. **Crear estudiante sin estos campos:**
   - Enviar POST sin estos campos
   - Verificar que se asignan valores por defecto

3. **Actualizar estudiante:**
   - Enviar PUT para actualizar estos campos
   - Verificar que se actualizan correctamente

4. **Obtener estudiante:**
   - Hacer GET de un estudiante con estos campos
   - Verificar que se devuelven correctamente

---

## 📞 Soporte

Si tienes dudas sobre:
- Los valores posibles de los enums: consulta el código del frontend
- El formato de los datos: revisa los ejemplos en este documento
- Problemas de validación: verifica que los valores coincidan con los listados aquí

---

**Fecha de actualización:** 9 de marzo de 2026  
**Versión del formulario:** Actualizada con todos los campos de Características de la Vivienda
